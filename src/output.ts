import sliceAnsi from "slice-ansi";
import stringWidth from "string-width";
import widestLine from "widest-line";
import {
  type StyledChar,
  styledCharsFromTokens,
  styledCharsToString,
  tokenize,
} from "@alcalzone/ansi-tokenize";
import { type OutputTransformer } from "./render-node-to-output.js";
import { type Dimension } from "./dimension.js";

/**
 * Union type for possible operations on the output.
 */
type Operation = WriteOperation | ClipOperation | UnclipOperation;

/**
 * Represents a write operation to the output.
 */
interface WriteOperation {
  /** Operation type discriminator. */
  type: "write";
  /** X coordinate (column) to write at. */
  x: number;
  /** Y coordinate (row) to write at. */
  y: number;
  /** Text content to write. */
  text: string;
  /** Array of transformers to apply to the text. */
  transformers: OutputTransformer[];
}

/**
 * Represents a clip operation to restrict drawing area.
 */
interface ClipOperation {
  /** Operation type discriminator. */
  type: "clip";
  /** Clipping rectangle definition. */
  clip: Clip;
}

/**
 * Represents a clipping rectangle.
 */
interface Clip {
  /** Left boundary (undefined for no limit). */
  x1: number | undefined;
  /** Right boundary (undefined for no limit). */
  x2: number | undefined;
  /** Top boundary (undefined for no limit). */
  y1: number | undefined;
  /** Bottom boundary (undefined for no limit). */
  y2: number | undefined;
}

/**
 * Represents an unclip operation to restore drawing area.
 */
interface UnclipOperation {
  /** Operation type discriminator. */
  type: "unclip";
}

/**
 * "Virtual" output class
 *
 * Handles the positioning and saving of the output of each node in the tree.
 * Also responsible for applying transformations to each character.
 *
 * Used to generate the final output of all nodes before writing to stdout.
 */
export class Output {
  width: number;
  height: number;

  private readonly operations: Operation[] = [];

  /**
   * Creates a new Output instance.
   *
   * @param dimension - Dimensions containing width and height.
   */
  constructor(dimension: Dimension) {
    const { width, height } = dimension;

    this.width = width;
    this.height = height;
  }

  /**
   * Writes text to the output at a specified position.
   *
   * @param x - The x-coordinate (column).
   * @param y - The y-coordinate (row).
   * @param text - The text to write.
   * @param options - Options containing transformers.
   */
  write(
    x: number,
    y: number,
    text: string,
    options: { transformers: OutputTransformer[] },
  ): void {
    const { transformers } = options;

    if (!text) {
      return;
    }

    this.operations.push({
      type: "write",
      x,
      y,
      text,
      transformers,
    });
  }

  /**
   * Sets a clipping area for subsequent operations.
   *
   * @param clip - The clipping rectangle.
   */
  clip(clip: Clip) {
    this.operations.push({
      type: "clip",
      clip,
    });
  }

  /**
   * Removes the last clipping area, restoring the previous one.
   */
  unclip() {
    this.operations.push({
      type: "unclip",
    });
  }

  /**
   * Generates the final output string and its height.
   *
   * @returns An object containing the generated output string and its height.
   */
  get(): { output: string; height: number } {
    // Initialize output array with a specific set of rows, so that
    // margin/padding at the bottom is preserved
    const output: StyledChar[][] = [];

    for (let y = 0; y < this.height; y++) {
      const row: StyledChar[] = [];

      for (let x = 0; x < this.width; x++) {
        row.push({
          type: "char",
          value: " ",
          fullWidth: false,
          styles: [],
        });
      }

      output.push(row);
    }

    const clips: Clip[] = [];

    for (const operation of this.operations) {
      if (operation.type === "clip") {
        clips.push(operation.clip);
      }

      if (operation.type === "unclip") {
        clips.pop();
      }

      if (operation.type === "write") {
        const { text, transformers } = operation;
        let { x, y } = operation;
        let lines = text.split("\n");

        const clip = clips.at(-1);

        if (clip) {
          const clipHorizontally =
            typeof clip.x1 === "number" && typeof clip.x2 === "number";

          const clipVertically =
            typeof clip.y1 === "number" && typeof clip.y2 === "number";

          const clipX1 = clip.x1 ?? 0;
          const clipX2 = clip.x2 ?? 0;

          const clipY1 = clip.y1 ?? 0;
          const clipY2 = clip.y2 ?? 0;

          // If text is positioned outside of clipping area altogether,
          // skip to the next operation to avoid unnecessary calculations
          if (clipHorizontally) {
            const width = widestLine(text);

            if (x + width < clipX1 || x > clipX2) {
              continue;
            }
          }

          if (clipVertically) {
            const height = lines.length;

            if (y + height < clipY1 || y > clipY2) {
              continue;
            }
          }

          if (clipHorizontally) {
            lines = lines.map((line) => {
              const from = x < clipX1 ? clipX1 - x : 0;
              const width = stringWidth(line);
              const to = x + width > clipX2 ? clipX2 - x : width;

              return sliceAnsi(line, from, to);
            });

            if (x < clipX1) {
              x = clipX1;
            }
          }

          if (clipVertically) {
            const from = y < clipY1 ? clipY1 - y : 0;
            const height = lines.length;
            const to = y + height > clipY2 ? clipY2 - y : height;

            lines = lines.slice(from, to);

            if (y < clipY1) {
              y = clipY1;
            }
          }
        }

        let offsetY = 0;

        for (const [index, line] of lines.entries()) {
          const currentLine = output[y + offsetY];

          // Line can be missing if `text` is taller than height of
          // pre-initialized `this.output`
          if (!currentLine) {
            continue;
          }

          let transformedLine = line;
          for (const transformer of transformers) {
            transformedLine = transformer(transformedLine, index);
          }

          const characters = styledCharsFromTokens(tokenize(transformedLine));
          let offsetX = x;

          for (const character of characters) {
            currentLine[offsetX] = character;

            // Determine printed width using string-width to align with measurement
            const characterWidth = Math.max(1, stringWidth(character.value));

            // For multi-column characters, clear following cells to avoid stray
            // spaces/artifacts
            if (characterWidth > 1) {
              for (let index = 1; index < characterWidth; index++) {
                currentLine[offsetX + index] = {
                  type: "char",
                  value: "",
                  fullWidth: false,
                  styles: character.styles,
                };
              }
            }

            offsetX += characterWidth;
          }

          offsetY++;
        }
      }
    }

    const generatedOutput = output
      .map((line) => {
        const lineWithoutEmptyItems = line.filter((item) => item !== undefined);
        return styledCharsToString(lineWithoutEmptyItems).trimEnd();
      })
      .join("\n");

    return {
      output: generatedOutput,
      height: output.length,
    };
  }
}
