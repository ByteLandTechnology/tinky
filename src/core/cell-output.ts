/**
 * Output implementation that writes directly into CellBuffer.
 */

import sliceAnsi from "slice-ansi";
import stringWidth from "string-width";
import widestLine from "widest-line";
import { styledCharsFromTokens, tokenize } from "@alcalzone/ansi-tokenize";
import { type CellBuffer } from "./cell-buffer.js";
import {
  type Clip,
  type OutputLike,
  type OutputWriteOptions,
} from "./output.js";
import { type AnsiCode } from "../types/ansi.js";

export class CellOutput implements OutputLike {
  private readonly clips: Clip[] = [];

  readonly buffer: CellBuffer;

  constructor(buffer: CellBuffer) {
    this.buffer = buffer;
  }

  clip(clip: Clip): void {
    this.clips.push(clip);
  }

  unclip(): void {
    this.clips.pop();
  }

  fill(
    x: number,
    y: number,
    length: number,
    char: string,
    charWidth: number,
    styles: AnsiCode[],
  ): void {
    if (length <= 0) {
      return;
    }

    const visualLength = length * charWidth;
    let startX = x;
    let endX = x + visualLength;
    const row = y;

    const clip = this.clips.at(-1);

    if (clip) {
      const clipY1 = clip.y1 ?? 0;
      // Clipping logic: y2 is exclusive boundary
      if (clip.y2 !== undefined && row >= clip.y2) {
        return;
      }
      if (row < clipY1) {
        return;
      }

      const clipX1 = clip.x1 ?? 0;
      startX = Math.max(startX, clipX1);

      if (clip.x2 !== undefined) {
        endX = Math.min(endX, clip.x2);
      }
    }

    const fillVisualLength = endX - startX;
    if (fillVisualLength <= 0) {
      return;
    }

    const styleId = this.buffer.styleRegistry.getId(styles);
    this.buffer.fill(startX, row, fillVisualLength, char, charWidth, styleId);
  }

  write(x: number, y: number, text: string, options: OutputWriteOptions): void {
    const { transformers } = options;
    if (!text) {
      return;
    }

    let writeX = x;
    let writeY = y;
    let lines = text.split("\n");
    // Match Output.get() semantics: transformed lines may intentionally keep
    // trailing spaces (for alignment or visual effects), so mark them.
    const preserveLineTrailingSpaces = transformers.length > 0;

    const clip = this.clips.at(-1);
    if (clip) {
      const clipHorizontally =
        typeof clip.x1 === "number" && typeof clip.x2 === "number";
      const clipVertically =
        typeof clip.y1 === "number" && typeof clip.y2 === "number";

      const clipX1 = clip.x1 ?? 0;
      const clipX2 = clip.x2 ?? 0;
      const clipY1 = clip.y1 ?? 0;
      const clipY2 = clip.y2 ?? 0;

      if (clipHorizontally) {
        const width = widestLine(text);
        if (writeX + width < clipX1 || writeX > clipX2) {
          return;
        }
      }

      if (clipVertically) {
        const height = lines.length;
        if (writeY + height < clipY1 || writeY > clipY2) {
          return;
        }
      }

      if (clipHorizontally) {
        lines = lines.map((line) => {
          const from = writeX < clipX1 ? clipX1 - writeX : 0;
          const width = stringWidth(line);
          const to = writeX + width > clipX2 ? clipX2 - writeX : width;
          return sliceAnsi(line, from, to);
        });

        if (writeX < clipX1) {
          writeX = clipX1;
        }
      }

      if (clipVertically) {
        const from = writeY < clipY1 ? clipY1 - writeY : 0;
        const height = lines.length;
        const to = writeY + height > clipY2 ? clipY2 - writeY : height;
        lines = lines.slice(from, to);

        if (writeY < clipY1) {
          writeY = clipY1;
        }
      }
    }

    let offsetY = 0;
    for (const [lineIndex, line] of lines.entries()) {
      const row = writeY + offsetY;

      if (row < 0) {
        offsetY++;
        continue;
      }
      if (row >= this.buffer.height) {
        break;
      }

      let transformedLine = line;
      for (const transformer of transformers) {
        transformedLine = transformer(transformedLine, lineIndex);
      }

      const styledChars = styledCharsFromTokens(tokenize(transformedLine));
      let offsetX = writeX;

      for (const char of styledChars) {
        const charWidth = Math.max(1, stringWidth(char.value));

        if (offsetX < 0) {
          offsetX += charWidth;
          continue;
        }
        if (offsetX >= this.buffer.width) {
          break;
        }
        if (offsetX + charWidth > this.buffer.width) {
          break;
        }

        const styleId = this.buffer.styleRegistry.getId(char.styles);
        this.buffer.setCell(
          offsetX,
          row,
          char.value,
          charWidth,
          styleId,
          preserveLineTrailingSpaces,
        );
        offsetX += charWidth;
      }

      offsetY++;
    }
  }
}
