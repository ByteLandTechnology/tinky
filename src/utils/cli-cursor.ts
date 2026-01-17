import { type Writable } from "node:stream";
import process from "node:process";

const kHideCursor = "\u001B[?25l";
const kShowCursor = "\u001B[?25h";

/**
 * Show the cursor.
 *
 * @param stream - The stream to show the cursor on. Defaults to `process.stderr`.
 */
export function show(stream: Writable = process.stderr): void {
  stream.write(kShowCursor);
}

/**
 * Hide the cursor.
 *
 * @param stream - The stream to hide the cursor on. Defaults to `process.stderr`.
 */
export function hide(stream: Writable = process.stderr): void {
  stream.write(kHideCursor);
}

/**
 * Toggle cursor visibility.
 *
 * @param force - If `true`, shows the cursor. If `false`, hides the cursor.
 * @param stream - The stream to toggle the cursor on. Defaults to `process.stderr`.
 */
export function toggle(
  force?: boolean,
  stream: Writable = process.stderr,
): void {
  if (force !== undefined) {
    if (force) {
      show(stream);
    } else {
      hide(stream);
    }
  }
}
