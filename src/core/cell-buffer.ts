/**
 * Cell-buffer rendering primitives.
 *
 * This stores terminal cells in compact parallel arrays and keeps ANSI styles
 * as small numeric IDs via StyleRegistry.
 */

import { type AnsiCode } from "../types/ansi.js";

export interface CellBufferSize {
  width: number;
  height: number;
}

export class StyleRegistry {
  private readonly keyToId = new Map<string, number>();
  private readonly idToStyles: AnsiCode[][] = [];

  constructor() {
    // id=0 is "no style"
    this.keyToId.set("", 0);
    this.idToStyles[0] = [];
  }

  static keyFor(styles: readonly AnsiCode[] | null | undefined): string {
    if (!styles || styles.length === 0) {
      return "";
    }

    let key = "";
    for (const style of styles) {
      key += style.code;
      key += "\u0000";
      key += style.endCode;
      key += "\u0001";
    }

    return key;
  }

  getId(styles: readonly AnsiCode[] | null | undefined): number {
    const key = StyleRegistry.keyFor(styles);
    const cached = this.keyToId.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const id = this.idToStyles.length;
    const cloned = (styles ?? []).map((style) => ({
      type: "ansi" as const,
      code: style.code,
      endCode: style.endCode,
    }));

    this.keyToId.set(key, id);
    this.idToStyles[id] = cloned;
    return id;
  }

  getStyles(id: number): readonly AnsiCode[] {
    return this.idToStyles[id] ?? [];
  }
}

export class CellBuffer {
  width = 0;
  height = 0;

  readonly styleRegistry: StyleRegistry;

  /**
   * Per-cell visible glyph. Continuation cells store empty string.
   */
  chars: string[] = [];

  /**
   * Per-cell display width: 1 or 2 on leading cells, 0 on continuation cells.
   */
  widths: Uint8Array = new Uint8Array(0);

  /**
   * Per-cell style id. Continuation cells keep the leading style id.
   */
  styleIds: Uint32Array = new Uint32Array(0);

  /**
   * Marks whether a cell was explicitly written in the current frame.
   */
  touched: Uint8Array = new Uint8Array(0);

  /**
   * Marks whether trailing spaces on a touched cell should be preserved.
   */
  preserveTrailingSpace: Uint8Array = new Uint8Array(0);

  constructor(
    size: CellBufferSize = { width: 0, height: 0 },
    styleRegistry?: StyleRegistry,
  ) {
    this.styleRegistry = styleRegistry ?? new StyleRegistry();
    this.resize(size.width, size.height);
    this.clear();
  }

  resize(width: number, height: number): void {
    const nextWidth = Math.max(0, Math.floor(width));
    const nextHeight = Math.max(0, Math.floor(height));

    if (this.width === nextWidth && this.height === nextHeight) {
      return;
    }

    this.width = nextWidth;
    this.height = nextHeight;

    const size = nextWidth * nextHeight;
    this.chars = new Array(size);
    this.widths = new Uint8Array(size);
    this.styleIds = new Uint32Array(size);
    this.touched = new Uint8Array(size);
    this.preserveTrailingSpace = new Uint8Array(size);
  }

  clear(styleId = 0): void {
    const size = this.width * this.height;
    this.chars.fill(" ", 0, size);
    this.widths.fill(1, 0, size);
    this.styleIds.fill(styleId, 0, size);
    this.touched.fill(0, 0, size);
    this.preserveTrailingSpace.fill(0, 0, size);
  }

  /**
   * Converts `(x, y)` coordinates to a linear index in parallel arrays.
   */
  index(x: number, y: number): number {
    return y * this.width + x;
  }

  setCell(
    x: number,
    y: number,
    ch: string,
    charWidth: number,
    styleId: number,
    preserveTrailing = false,
  ) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return;
    }

    const width = Math.max(1, Math.floor(charWidth));
    if (x + width > this.width) {
      return;
    }

    const cellIndex = this.index(x, y);
    this.chars[cellIndex] = ch;
    this.widths[cellIndex] = width;
    this.styleIds[cellIndex] = styleId;
    this.touched[cellIndex] = 1;
    this.preserveTrailingSpace[cellIndex] = preserveTrailing ? 1 : 0;

    if (width > 1) {
      for (let i = 1; i < width; i++) {
        const continuationIndex = cellIndex + i;
        this.chars[continuationIndex] = "";
        this.widths[continuationIndex] = 0;
        this.styleIds[continuationIndex] = styleId;
        this.touched[continuationIndex] = 1;
        this.preserveTrailingSpace[continuationIndex] = preserveTrailing
          ? 1
          : 0;
      }
    }
  }

  fill(
    x: number,
    y: number,
    length: number,
    char: string,
    charWidth: number,
    styleId: number,
  ): void {
    if (y < 0 || y >= this.height || length <= 0) {
      return;
    }

    const startX = Math.max(0, x);
    const endX = Math.min(this.width, x + length);
    const fillLength = endX - startX;

    if (fillLength <= 0) {
      return;
    }

    const start = this.index(startX, y);

    // Optimized path for single-width characters (common for background/borders)
    if (charWidth === 1) {
      const end = start + fillLength;
      this.chars.fill(char, start, end);
      this.widths.fill(1, start, end);
      this.styleIds.fill(styleId, start, end);
      this.touched.fill(1, start, end);
      this.preserveTrailingSpace.fill(0, start, end);
      return;
    }

    // Fallback for multi-width characters
    for (let i = 0; i < fillLength; i += charWidth) {
      this.setCell(startX + i, y, char, charWidth, styleId, false);
    }
  }

  isRowEqual(other: CellBuffer, row: number): boolean {
    if (this.width !== other.width || this.height !== other.height) {
      return false;
    }

    if (row < 0 || row >= this.height) {
      return false;
    }

    const start = row * this.width;
    const end = start + this.width;

    for (let index = start; index < end; index++) {
      if (this.styleIds[index] !== other.styleIds[index]) {
        return false;
      }
      if (this.widths[index] !== other.widths[index]) {
        return false;
      }
      if (this.chars[index] !== other.chars[index]) {
        return false;
      }
      if (this.touched[index] !== other.touched[index]) {
        return false;
      }
      if (
        this.preserveTrailingSpace[index] !== other.preserveTrailingSpace[index]
      ) {
        return false;
      }
    }

    return true;
  }

  isEqual(other: CellBuffer): boolean {
    if (this.width !== other.width || this.height !== other.height) {
      return false;
    }

    for (let row = 0; row < this.height; row++) {
      if (!this.isRowEqual(other, row)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Computes the visible right edge for a row.
   *
   * This keeps transformer-produced trailing spaces when `preserveTrailingSpace`
   * is set, while trimming untouched or default trailing cells.
   */
  getRowRightEdge(row: number): number {
    const width = this.width;
    if (row < 0 || row >= this.height) {
      return 0;
    }

    const offset = row * width;
    for (let x = width - 1; x >= 0; x--) {
      const index = offset + x;
      if (this.widths[index] === 0) {
        continue;
      }

      if (this.touched[index] === 0) {
        continue;
      }

      const canTrimUnstyledSpace =
        this.chars[index] === " " &&
        this.styleIds[index] === 0 &&
        this.preserveTrailingSpace[index] === 0;
      if (canTrimUnstyledSpace) {
        continue;
      }

      const cellWidth = this.widths[index] || 1;
      return Math.min(width, x + cellWidth);
    }

    return 0;
  }

  /**
   * Closes active styles and opens next styles when style id changes.
   */
  appendStyleTransition(
    out: string[],
    activeStyleId: number,
    nextStyleId: number,
  ): number {
    if (activeStyleId === nextStyleId) {
      return activeStyleId;
    }

    const activeStyles = this.styleRegistry.getStyles(activeStyleId);
    for (let i = activeStyles.length - 1; i >= 0; i--) {
      out.push(activeStyles[i]?.endCode);
    }

    const nextStyles = this.styleRegistry.getStyles(nextStyleId);
    for (const style of nextStyles) {
      out.push(style.code);
    }

    return nextStyleId;
  }

  /**
   * Closes any currently active style sequence.
   */
  appendCloseActiveStyle(out: string[], activeStyleId: number): number {
    if (activeStyleId === 0) {
      return 0;
    }

    const activeStyles = this.styleRegistry.getStyles(activeStyleId);
    for (let i = activeStyles.length - 1; i >= 0; i--) {
      out.push(activeStyles[i]?.endCode);
    }

    return 0;
  }

  /**
   * Serializes a contiguous range of cells from one row, preserving ANSI style
   * transitions and wide-character boundaries.
   */
  appendStyledRange(
    row: number,
    start: number,
    end: number,
    out: string[],
    activeStyleId: number,
    cursorX: number,
  ): { cursorX: number; activeStyleId: number } {
    const width = this.width;
    if (row < 0 || row >= this.height) {
      return { cursorX, activeStyleId };
    }

    const safeStart = Math.max(0, Math.min(width, start));
    const safeEnd = Math.max(0, Math.min(width, end));
    if (safeEnd <= safeStart) {
      return { cursorX, activeStyleId };
    }

    const rowOffset = row * width;
    let x = safeStart;
    while (x < safeEnd) {
      const index = rowOffset + x;
      const cellWidth = this.widths[index];
      if (cellWidth === 0) {
        x++;
        continue;
      }

      const styleId = this.styleIds[index];
      activeStyleId = this.appendStyleTransition(out, activeStyleId, styleId);

      out.push(this.chars[index] ?? " ");
      const advance = cellWidth || 1;
      cursorX += advance;
      x += advance;
    }

    return { cursorX, activeStyleId };
  }

  /**
   * Serializes one row into ANSI text, trimming only non-visible tail cells.
   */
  serializeRow(row: number): string {
    const rightEdge = this.getRowRightEdge(row);
    if (rightEdge === 0) {
      return "";
    }

    const out: string[] = [];
    const { activeStyleId } = this.appendStyledRange(
      row,
      0,
      rightEdge,
      out,
      0,
      0,
    );
    this.appendCloseActiveStyle(out, activeStyleId);
    return out.join("");
  }

  /**
   * Serializes the entire buffer into a multi-line ANSI string.
   */
  toString(): string {
    const lines: string[] = [];
    for (let row = 0; row < this.height; row++) {
      lines.push(this.serializeRow(row));
    }
    return lines.join("\n");
  }
}
