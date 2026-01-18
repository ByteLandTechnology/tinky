import { type WriteStream } from "../types/io.js";

const kHideCursor = "\u001B[?25l";
const kShowCursor = "\u001B[?25h";

/**
 * Show the cursor.
 *
 * @param stream - The stream to show the cursor on.
 */
export function show(stream: WriteStream): void {
  stream.write(kShowCursor);
}

/**
 * Hide the cursor.
 *
 * @param stream - The stream to hide the cursor on.
 */
export function hide(stream: WriteStream): void {
  stream.write(kHideCursor);
}

/**
 * Toggle cursor visibility.
 *
 * @param force - If `true`, shows the cursor. If `false`, hides the cursor.
 * @param stream - The stream to toggle the cursor on.
 */
export function toggle(force: boolean | undefined, stream: WriteStream): void {
  if (force !== undefined) {
    if (force) {
      show(stream);
    } else {
      hide(stream);
    }
  }
}
