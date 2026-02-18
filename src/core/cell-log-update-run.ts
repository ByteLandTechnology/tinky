import { type WriteStream } from "../types/io.js";
import ansiEscapes from "../utils/ansi-escapes.js";
import * as cliCursor from "../utils/cli-cursor.js";
import { type CellBuffer } from "./cell-buffer.js";

/**
 * Run-diff renderer for interactive terminal output.
 *
 * Compared with line-diff mode, this renderer diffs cell buffers and emits
 * minimal cursor movement + text writes for changed runs.
 */
export interface CellLogUpdateRunOptions {
  /** Enables diff updates. Set `false` to force full-frame redraws. */
  incremental?: boolean;
  /** Keeps the terminal cursor visible during updates. */
  showCursor?: boolean;
  /** Gap merge threshold used by `mergeStrategy: "threshold"`. */
  mergeThreshold?: number;
  /** Segment merge policy. `cost` chooses cheapest bytes, `threshold` uses gap. */
  mergeStrategy?: "cost" | "threshold";
  /** Fallback to full-row writes when too many segments are present. */
  maxSegmentsBeforeFullRow?: number;
  /** Penalty when overwriting unchanged gaps in `cost` mode. */
  overwriteGapPenaltyBytes?: number;
}

export interface RenderOptions {
  /** Forces full redraw for the current frame. */
  forceFull?: boolean;
}

export type CellLogUpdateRender = ((
  prevBuffer: CellBuffer,
  nextBuffer: CellBuffer,
  options?: RenderOptions,
) => void) & {
  /** Erases currently rendered interactive frame. */
  clear: () => void;
  /** Resets internal frame state without writing to stream. */
  reset: () => void;
  /** Synchronizes internal state after an external full redraw. */
  sync: (buffer: CellBuffer) => void;
  /** Finalizes renderer and restores cursor visibility. */
  done: () => void;
};

interface Segment {
  start: number;
  end: number;
}
type MoveMethod = "forward" | "abs";
/** Planned row-level operation for the cost model. */
type RowOp =
  | { kind: "move"; toX: number; method: MoveMethod }
  | { kind: "write"; start: number; end: number };

const cursorToColumn = (x: number): string => ansiEscapes.cursorTo(x);
const cursorForward = (count: number): string =>
  ansiEscapes.cursorForward(count);

/**
 * Compares two cells at an absolute row/column, including style and width.
 */
const cellsEqualAt = (
  prevBuffer: CellBuffer,
  nextBuffer: CellBuffer,
  row: number,
  x: number,
): boolean => {
  const idx = row * nextBuffer.width + x;
  return (
    prevBuffer.styleIds[idx] === nextBuffer.styleIds[idx] &&
    prevBuffer.widths[idx] === nextBuffer.widths[idx] &&
    prevBuffer.chars[idx] === nextBuffer.chars[idx]
  );
};

/**
 * Rewinds to the first cell of a glyph when `x` lands in a continuation cell.
 */
const findGlyphStart = (buffer: CellBuffer, row: number, x: number): number => {
  if (x <= 0) {
    return 0;
  }

  const rowOffset = row * buffer.width;
  let currentX = x;
  while (currentX > 0 && buffer.widths[rowOffset + currentX] === 0) {
    currentX--;
  }
  return currentX;
};

/**
 * Extends an end position so we never split a wide character.
 */
const alignEndToGlyphBoundary = (
  buffer: CellBuffer,
  row: number,
  end: number,
): number => {
  const width = buffer.width;
  let safeEnd = Math.max(0, Math.min(width, end));
  if (safeEnd <= 0 || safeEnd >= width) {
    return safeEnd <= 0 ? 0 : width;
  }

  const rowOffset = row * width;
  let x = safeEnd - 1;
  while (x > 0 && buffer.widths[rowOffset + x] === 0) {
    x--;
  }

  const cellWidth = buffer.widths[rowOffset + x] || 1;
  const glyphEnd = x + cellWidth;
  if (glyphEnd > safeEnd) {
    safeEnd = Math.min(width, glyphEnd);
  }

  return safeEnd;
};

/**
 * Finds changed cell runs for one row and normalizes them to glyph boundaries.
 */
const computeSegments = (
  prevBuffer: CellBuffer,
  nextBuffer: CellBuffer,
  row: number,
  scanEnd: number,
): Segment[] => {
  const width = nextBuffer.width;
  const end = Math.max(0, Math.min(width, scanEnd));
  const segments: Segment[] = [];

  let inSegment = false;
  let segmentStart = 0;
  for (let x = 0; x < end; x++) {
    const isDiff = !cellsEqualAt(prevBuffer, nextBuffer, row, x);
    if (isDiff && !inSegment) {
      inSegment = true;
      segmentStart = x;
    } else if (!isDiff && inSegment) {
      segments.push({ start: segmentStart, end: x });
      inSegment = false;
    }
  }

  if (inSegment) {
    segments.push({ start: segmentStart, end });
  }

  for (const segment of segments) {
    segment.start = findGlyphStart(nextBuffer, row, segment.start);
    segment.end = alignEndToGlyphBoundary(nextBuffer, row, segment.end);
  }

  segments.sort((a, b) => a.start - b.start);
  const merged: Segment[] = [];

  for (const segment of segments) {
    if (merged.length === 0) {
      merged.push({ ...segment });
      continue;
    }

    const last = merged.at(-1);
    if (!last) {
      continue;
    }
    if (segment.start <= last.end) {
      last.end = Math.max(last.end, segment.end);
    } else {
      merged.push({ ...segment });
    }
  }

  return merged;
};

/**
 * Merges nearby segments using a fixed gap threshold.
 */
const mergeByGapThreshold = (
  segments: Segment[],
  mergeThreshold: number,
): Segment[] => {
  if (segments.length <= 1) {
    return segments;
  }

  const merged: Segment[] = [];
  for (const segment of segments) {
    if (merged.length === 0) {
      merged.push({ ...segment });
      continue;
    }

    const last = merged.at(-1);
    if (!last) {
      continue;
    }
    const gap = segment.start - last.end;
    if (gap <= mergeThreshold) {
      last.end = Math.max(last.end, segment.end);
    } else {
      merged.push({ ...segment });
    }
  }

  return merged;
};

const asciiByteLength = (value: string): number => value.length;

const utf8ByteLength = (value: string): number => {
  let bytes = 0;
  for (const char of value) {
    const codePoint = char.codePointAt(0) ?? 0;
    if (codePoint <= 0x7f) {
      bytes += 1;
    } else if (codePoint <= 0x7ff) {
      bytes += 2;
    } else if (codePoint <= 0xffff) {
      bytes += 3;
    } else {
      bytes += 4;
    }
  }
  return bytes;
};

const digits10 = (input: number): number => {
  let value = input;
  let digits = 1;
  while (value >= 10) {
    value = Math.floor(value / 10);
    digits++;
  }
  return digits;
};

const bytesCursorForward = (delta: number): number => {
  if (delta <= 0) {
    return 0;
  }
  return 3 + digits10(delta);
};

const bytesCursorToColumn = (column0: number): number => {
  const column = Math.max(0, column0) + 1;
  return 3 + digits10(column);
};

/**
 * Chooses between relative forward movement and absolute column movement based
 * on encoded byte cost.
 */
const chooseHorizontalMove = (
  fromX: number,
  toX: number,
): { bytes: number; method: MoveMethod } => {
  if (toX <= fromX) {
    return { bytes: bytesCursorToColumn(toX), method: "abs" };
  }

  const delta = toX - fromX;
  const forwardBytes = bytesCursorForward(delta);
  const absoluteBytes = bytesCursorToColumn(toX);
  if (forwardBytes <= absoluteBytes) {
    return { bytes: forwardBytes, method: "forward" };
  }

  return { bytes: absoluteBytes, method: "abs" };
};

interface StyleLens {
  open: number;
  close: number;
}

const getStyleLens = (
  buffer: CellBuffer,
  styleLenCache: Map<number, StyleLens>,
  styleId: number,
): StyleLens => {
  const cached = styleLenCache.get(styleId);
  if (cached) {
    return cached;
  }

  const styles = buffer.styleRegistry.getStyles(styleId);
  let open = 0;
  let close = 0;

  for (const style of styles) {
    open += asciiByteLength(style.code);
    close += asciiByteLength(style.endCode);
  }

  const lens = { open, close };
  styleLenCache.set(styleId, lens);
  return lens;
};

const transitionBytes = (
  buffer: CellBuffer,
  styleLenCache: Map<number, StyleLens>,
  fromId: number,
  toId: number,
): number => {
  if (fromId === toId) {
    return 0;
  }

  const from = getStyleLens(buffer, styleLenCache, fromId);
  const to = getStyleLens(buffer, styleLenCache, toId);
  return from.close + to.open;
};

const closeBytes = (
  buffer: CellBuffer,
  styleLenCache: Map<number, StyleLens>,
  activeStyleId: number,
): number => {
  if (activeStyleId === 0) {
    return 0;
  }
  return getStyleLens(buffer, styleLenCache, activeStyleId).close;
};

/**
 * Estimates bytes written for a styled range and returns resulting cursor/style.
 */
const measureStyledRange = (
  buffer: CellBuffer,
  styleLenCache: Map<number, StyleLens>,
  row: number,
  start: number,
  end: number,
  activeStyleId: number,
  cursorX: number,
): { bytes: number; activeStyleId: number; cursorX: number } => {
  const width = buffer.width;
  const safeStart = Math.max(0, Math.min(width, start));
  const safeEnd = Math.max(0, Math.min(width, end));
  if (safeEnd <= safeStart) {
    return { bytes: 0, activeStyleId, cursorX };
  }

  let bytes = 0;
  const rowOffset = row * width;
  let x = safeStart;

  while (x < safeEnd) {
    const index = rowOffset + x;
    const cellWidth = buffer.widths[index];

    if (cellWidth === 0) {
      x++;
      continue;
    }

    const styleId = buffer.styleIds[index] ?? 0;
    if (styleId !== activeStyleId) {
      bytes += transitionBytes(buffer, styleLenCache, activeStyleId, styleId);
      activeStyleId = styleId;
    }

    const char = buffer.chars[index] ?? " ";
    bytes += utf8ByteLength(char);

    const advance = cellWidth || 1;
    cursorX += advance;
    x += advance;
  }

  return { bytes, activeStyleId, cursorX };
};

/**
 * Builds row operations and compares patch cost versus full-row redraw cost.
 */
const planRowOpsWithCostModel = (
  nextBuffer: CellBuffer,
  styleLenCache: Map<number, StyleLens>,
  row: number,
  segments: Segment[],
  nextEnd: number,
  tailClear: boolean,
  overwriteGapPenaltyBytes: number,
): { useFullRow: boolean; ops: RowOp[] } => {
  const width = nextBuffer.width;
  const ops: RowOp[] = [];

  let patchBytes = 0;
  let cursorX = 0;
  let activeStyleId = 0;

  for (const segment of segments) {
    let segStart = segment.start;
    const segEnd = Math.min(width, segment.end);

    if (segStart < cursorX) {
      segStart = cursorX;
    }
    if (segStart >= segEnd) {
      continue;
    }

    if (segStart > cursorX) {
      const move = chooseHorizontalMove(cursorX, segStart);
      const split = measureStyledRange(
        nextBuffer,
        styleLenCache,
        row,
        segStart,
        segEnd,
        activeStyleId,
        segStart,
      );

      const splitCost = move.bytes + split.bytes;

      const gap = measureStyledRange(
        nextBuffer,
        styleLenCache,
        row,
        cursorX,
        segStart,
        activeStyleId,
        cursorX,
      );
      const mergedSegment = measureStyledRange(
        nextBuffer,
        styleLenCache,
        row,
        segStart,
        segEnd,
        gap.activeStyleId,
        segStart,
      );
      const mergeCost =
        gap.bytes + mergedSegment.bytes + overwriteGapPenaltyBytes;

      if (mergeCost <= splitCost) {
        ops.push({ kind: "write", start: cursorX, end: segStart });
        patchBytes += gap.bytes;
        cursorX = gap.cursorX;
        activeStyleId = gap.activeStyleId;

        ops.push({ kind: "write", start: segStart, end: segEnd });
        patchBytes += mergedSegment.bytes;
        cursorX = mergedSegment.cursorX;
        activeStyleId = mergedSegment.activeStyleId;
      } else {
        ops.push({ kind: "move", toX: segStart, method: move.method });
        patchBytes += move.bytes;
        cursorX = segStart;

        ops.push({ kind: "write", start: segStart, end: segEnd });
        patchBytes += split.bytes;
        cursorX = split.cursorX;
        activeStyleId = split.activeStyleId;
      }
    } else {
      const fullSegment = measureStyledRange(
        nextBuffer,
        styleLenCache,
        row,
        segStart,
        segEnd,
        activeStyleId,
        cursorX,
      );

      ops.push({ kind: "write", start: segStart, end: segEnd });
      patchBytes += fullSegment.bytes;
      cursorX = fullSegment.cursorX;
      activeStyleId = fullSegment.activeStyleId;
    }
  }

  patchBytes += closeBytes(nextBuffer, styleLenCache, activeStyleId);
  activeStyleId = 0;

  if (tailClear) {
    if (cursorX !== nextEnd) {
      patchBytes += chooseHorizontalMove(cursorX, nextEnd).bytes;
      cursorX = nextEnd;
    }

    patchBytes += asciiByteLength(ansiEscapes.eraseEndLine);
  }

  patchBytes += asciiByteLength(ansiEscapes.cursorNextLine);

  let fullBytes = 0;
  const fullRange = measureStyledRange(
    nextBuffer,
    styleLenCache,
    row,
    0,
    nextEnd,
    0,
    0,
  );
  fullBytes += fullRange.bytes;
  fullBytes += closeBytes(nextBuffer, styleLenCache, fullRange.activeStyleId);
  if (tailClear) {
    fullBytes += asciiByteLength(ansiEscapes.eraseEndLine);
  }
  fullBytes += asciiByteLength(ansiEscapes.cursorNextLine);

  if (patchBytes >= fullBytes) {
    return { useFullRow: true, ops: [] };
  }

  return { useFullRow: false, ops };
};

/**
 * Creates a run-diff renderer bound to one output stream.
 */
const create = (
  stream: WriteStream,
  options: CellLogUpdateRunOptions = {},
): CellLogUpdateRender => {
  const incremental = options.incremental ?? true;
  const showCursor = options.showCursor ?? false;
  const mergeStrategy = options.mergeStrategy ?? "cost";
  const mergeThreshold = Math.max(0, options.mergeThreshold ?? 2);
  const maxSegmentsBeforeFullRow = Math.max(
    1,
    options.maxSegmentsBeforeFullRow ?? 12,
  );
  const overwriteGapPenaltyBytes = Math.max(
    0,
    options.overwriteGapPenaltyBytes ?? 0,
  );

  const styleLenCache = new Map<number, StyleLens>();

  let previousHeight = 0;
  let hasHiddenCursor = false;
  const previousFrameLineCount = () =>
    previousHeight > 0 ? previousHeight + 1 : 0;

  const render = ((
    prevBuffer: CellBuffer,
    nextBuffer: CellBuffer,
    renderOptions: RenderOptions = {},
  ) => {
    const forceFull = renderOptions.forceFull ?? false;

    if (!showCursor && !hasHiddenCursor) {
      cliCursor.hide(stream);
      hasHiddenCursor = true;
    }

    const nextHeight = nextBuffer.height;
    const dimsChanged =
      previousHeight === 0 ||
      prevBuffer.width !== nextBuffer.width ||
      prevBuffer.height !== nextBuffer.height;

    // Full redraw path: used on first frame, dimension changes, or forced mode.
    if (forceFull || !incremental || dimsChanged) {
      const output = nextBuffer.toString();
      stream.write(
        ansiEscapes.eraseLines(previousFrameLineCount()) + output + "\n",
      );
      previousHeight = nextHeight;
      return;
    }

    const prevCount = previousHeight + 1;
    const nextCount = nextHeight + 1;
    const visibleCount = nextHeight;

    const chunks: string[] = [];
    if (nextCount < prevCount) {
      chunks.push(ansiEscapes.eraseLines(prevCount - nextCount + 1));
      chunks.push(ansiEscapes.cursorUp(visibleCount));
    } else {
      chunks.push(ansiEscapes.cursorUp(prevCount - 1));
    }

    const width = nextBuffer.width;

    // Incremental path: process one row at a time and emit minimal writes.
    for (let row = 0; row < visibleCount; row++) {
      if (prevBuffer.isRowEqual(nextBuffer, row)) {
        chunks.push(ansiEscapes.cursorNextLine);
        continue;
      }

      chunks.push(cursorToColumn(0));

      const nextEnd = nextBuffer.getRowRightEdge(row);
      const prevEnd = prevBuffer.getRowRightEdge(row);
      const tailClear = prevEnd > nextEnd;
      const scanEnd = tailClear ? nextEnd : Math.max(nextEnd, prevEnd);

      if (scanEnd === 0 && tailClear) {
        chunks.push(ansiEscapes.eraseEndLine);
        chunks.push(ansiEscapes.cursorNextLine);
        continue;
      }

      let segments = computeSegments(prevBuffer, nextBuffer, row, scanEnd);
      if (mergeStrategy === "threshold") {
        segments = mergeByGapThreshold(segments, mergeThreshold);
      }

      if (segments.length > maxSegmentsBeforeFullRow) {
        const full = nextBuffer.appendStyledRange(
          row,
          0,
          nextEnd,
          chunks,
          0,
          0,
        );
        let activeStyleId = full.activeStyleId;
        activeStyleId = nextBuffer.appendCloseActiveStyle(
          chunks,
          activeStyleId,
        );
        if (tailClear) {
          chunks.push(ansiEscapes.eraseEndLine);
        }
        chunks.push(ansiEscapes.cursorNextLine);
        continue;
      }

      if (segments.length === 0) {
        if (tailClear) {
          chunks.push(ansiEscapes.eraseEndLine);
        }
        chunks.push(ansiEscapes.cursorNextLine);
        continue;
      }

      let cursorX = 0;
      let activeStyleId = 0;

      if (mergeStrategy === "cost") {
        const plan = planRowOpsWithCostModel(
          nextBuffer,
          styleLenCache,
          row,
          segments,
          nextEnd,
          tailClear,
          overwriteGapPenaltyBytes,
        );

        if (plan.useFullRow) {
          const full = nextBuffer.appendStyledRange(
            row,
            0,
            nextEnd,
            chunks,
            activeStyleId,
            cursorX,
          );
          cursorX = full.cursorX;
          activeStyleId = full.activeStyleId;
          activeStyleId = nextBuffer.appendCloseActiveStyle(
            chunks,
            activeStyleId,
          );
          if (tailClear) {
            chunks.push(ansiEscapes.eraseEndLine);
          }
          chunks.push(ansiEscapes.cursorNextLine);
          continue;
        }

        for (const op of plan.ops) {
          if (op.kind === "move") {
            const toX = Math.max(0, Math.min(width, op.toX));
            const delta = toX - cursorX;
            if (delta === 0) {
              continue;
            }

            if (delta > 0) {
              if (op.method === "abs") {
                chunks.push(cursorToColumn(toX));
              } else {
                chunks.push(cursorForward(delta));
              }
              cursorX = toX;
            } else {
              chunks.push(cursorToColumn(toX));
              cursorX = toX;
            }
            continue;
          }

          let start = op.start;
          const end = op.end;

          if (start < cursorX) {
            start = cursorX;
          }
          if (start >= end) {
            continue;
          }

          if (start !== cursorX) {
            const move = chooseHorizontalMove(cursorX, start);
            if (move.method === "abs") {
              chunks.push(cursorToColumn(start));
            } else {
              chunks.push(cursorForward(start - cursorX));
            }
            cursorX = start;
          }

          const result = nextBuffer.appendStyledRange(
            row,
            start,
            end,
            chunks,
            activeStyleId,
            cursorX,
          );
          cursorX = result.cursorX;
          activeStyleId = result.activeStyleId;
        }
      } else {
        for (const segment of segments) {
          let segStart = segment.start;
          const segEnd = Math.min(width, segment.end);

          if (segStart < cursorX) {
            segStart = cursorX;
          }
          if (segStart >= segEnd) {
            continue;
          }

          const delta = segStart - cursorX;
          if (delta > 0) {
            chunks.push(cursorForward(delta));
            cursorX = segStart;
          } else if (delta < 0) {
            chunks.push(cursorToColumn(segStart));
            cursorX = segStart;
          }

          const result = nextBuffer.appendStyledRange(
            row,
            segStart,
            segEnd,
            chunks,
            activeStyleId,
            cursorX,
          );
          cursorX = result.cursorX;
          activeStyleId = result.activeStyleId;
        }
      }

      activeStyleId = nextBuffer.appendCloseActiveStyle(chunks, activeStyleId);

      if (tailClear) {
        if (cursorX !== nextEnd) {
          const move = chooseHorizontalMove(cursorX, nextEnd);
          if (move.method === "abs") {
            chunks.push(cursorToColumn(nextEnd));
          } else {
            chunks.push(cursorForward(Math.max(0, nextEnd - cursorX)));
          }
        }
        chunks.push(ansiEscapes.eraseEndLine);
      }

      chunks.push(ansiEscapes.cursorNextLine);
    }

    stream.write(chunks.join(""));
    previousHeight = nextHeight;
  }) as CellLogUpdateRender;

  render.clear = () => {
    stream.write(ansiEscapes.eraseLines(previousFrameLineCount()));
    previousHeight = 0;
  };

  render.reset = () => {
    previousHeight = 0;
  };

  render.sync = (buffer: CellBuffer) => {
    previousHeight = buffer.height;
  };

  render.done = () => {
    previousHeight = 0;
    if (!showCursor && hasHiddenCursor) {
      cliCursor.show(stream);
      hasHiddenCursor = false;
    }
  };

  return render;
};

export const cellLogUpdateRun = { create };
