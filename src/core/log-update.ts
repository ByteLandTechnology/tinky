import { type WriteStream } from "../types/io.js";
import ansiEscapes from "ansi-escapes";
import * as cliCursor from "../utils/cli-cursor.js";

/**
 * Interface definition for LogUpdate function and its methods.
 */
export interface LogUpdate {
  /**
   * Clears the output.
   */
  clear: () => void;

  /**
   * Persists the output and finishes the logging session.
   */
  done: () => void;

  /**
   * Updates the output synchronously.
   *
   * @param str - The string to log.
   */
  sync: (str: string) => void;

  /**
   * Updates the output.
   *
   * @param str - The string to log.
   */
  (str: string): void;
}

/**
 * Creates a standard LogUpdate instance.
 * Re-renders the entire previous output on each update.
 *
 * @param stream - The writable stream to log to.
 * @param options - Configuration options.
 * @param options.showCursor - Whether to show the cursor.
 * @returns A LogUpdate instance.
 */
const createStandard = (
  stream: WriteStream,
  { showCursor = false } = {},
): LogUpdate => {
  let previousLineCount = 0;
  let previousOutput = "";
  let hasHiddenCursor = false;

  const render = (str: string) => {
    if (!showCursor && !hasHiddenCursor) {
      cliCursor.hide(stream);
      hasHiddenCursor = true;
    }

    const output = str + "\n";
    if (output === previousOutput) {
      return;
    }

    previousOutput = output;
    stream.write(ansiEscapes.eraseLines(previousLineCount) + output);
    previousLineCount = output.split("\n").length;
  };

  render.clear = () => {
    stream.write(ansiEscapes.eraseLines(previousLineCount));
    previousOutput = "";
    previousLineCount = 0;
  };

  render.done = () => {
    previousOutput = "";
    previousLineCount = 0;

    if (!showCursor) {
      cliCursor.show(stream);
      hasHiddenCursor = false;
    }
  };

  render.sync = (str: string) => {
    const output = str + "\n";
    previousOutput = output;
    previousLineCount = output.split("\n").length;
  };

  return render;
};

/**
 * Creates an incremental LogUpdate instance.
 * Updates only changed lines to improve performance and reduce flickering.
 *
 * @param stream - The writable stream to log to.
 * @param options - Configuration options.
 * @param options.showCursor - Whether to show the cursor.
 * @returns A LogUpdate instance.
 */
const createIncremental = (
  stream: WriteStream,
  { showCursor = false } = {},
): LogUpdate => {
  let previousLines: string[] = [];
  let previousOutput = "";
  let hasHiddenCursor = false;

  const render = (str: string) => {
    if (!showCursor && !hasHiddenCursor) {
      cliCursor.hide(stream);
      hasHiddenCursor = true;
    }

    const output = str + "\n";
    if (output === previousOutput) {
      return;
    }

    const previousCount = previousLines.length;
    const nextLines = output.split("\n");
    const nextCount = nextLines.length;
    const visibleCount = nextCount - 1;

    if (output === "\n" || previousOutput.length === 0) {
      stream.write(ansiEscapes.eraseLines(previousCount) + output);
      previousOutput = output;
      previousLines = nextLines;
      return;
    }

    // We aggregate all chunks for incremental rendering into a buffer, and then
    // write them to stdout at the end.
    const buffer: string[] = [];

    // Clear extra lines if the current content's line count is lower than the
    // previous.
    if (nextCount < previousCount) {
      buffer.push(
        // Erases the trailing lines and the final newline slot.
        ansiEscapes.eraseLines(previousCount - nextCount + 1),
        // Positions cursor to the top of the rendered output.
        ansiEscapes.cursorUp(visibleCount),
      );
    } else {
      buffer.push(ansiEscapes.cursorUp(previousCount - 1));
    }

    for (let i = 0; i < visibleCount; i++) {
      // We do not write lines if the contents are the same. This prevents
      // flickering during renders.
      if (nextLines[i] === previousLines[i]) {
        buffer.push(ansiEscapes.cursorNextLine);
        continue;
      }

      buffer.push(
        ansiEscapes.cursorTo(0) +
          nextLines[i] +
          ansiEscapes.eraseEndLine +
          "\n",
      );
    }

    stream.write(buffer.join(""));

    previousOutput = output;
    previousLines = nextLines;
  };

  render.clear = () => {
    stream.write(ansiEscapes.eraseLines(previousLines.length));
    previousOutput = "";
    previousLines = [];
  };

  render.done = () => {
    previousOutput = "";
    previousLines = [];

    if (!showCursor) {
      cliCursor.show(stream);
      hasHiddenCursor = false;
    }
  };

  render.sync = (str: string) => {
    const output = str + "\n";
    previousOutput = output;
    previousLines = output.split("\n");
  };

  return render;
};

/**
 * Creates a LogUpdate instance.
 *
 * @param stream - The writable stream to log to.
 * @param options - Configuration options.
 * @param options.showCursor - Whether to show the cursor. Default is false.
 * @param options.incremental - Whether to use incremental rendering.
 * @returns A LogUpdate instance.
 */
const create = (
  stream: WriteStream,
  { showCursor = false, incremental = false } = {},
): LogUpdate => {
  if (incremental) {
    return createIncremental(stream, { showCursor });
  }

  return createStandard(stream, { showCursor });
};

export const logUpdate = { create };
