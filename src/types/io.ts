/**
 * Interface representing a writable stream (e.g., stdout/stderr).
 * This abstracts away Node.js's WriteStream to make Tinky environment-agnostic.
 *
 * @remarks
 * This interface provides the minimal set of methods required by Tinky to render output.
 * It mimics the Node.js `process.stdout` and `process.stderr` interfaces but is decoupled
 * from the Node.js runtime types.
 *
 * @example
 * ```typescript
 * const myStream: WriteStream = {
 *   write: (str) => { console.log(str); return true; },
 *   columns: 80,
 *   rows: 24
 * };
 * ```
 */
export interface WriteStream {
  /**
   * Writes a string to the stream.
   *
   * @param str - The string to write.
   * @param encoding - The encoding to use (e.g., 'utf8').
   * @param cb - Optional callback to be invoked when the write is complete.
   * @returns `true` if the string has been flushed to the kernel buffer.
   */
  write(
    str: string,
    encoding?: string,
    cb?: (err?: Error | null) => void,
  ): boolean;

  /**
   * Number of columns in the terminal.
   *
   * @remarks
   * This property is used by Tinky to calculate layout and wrap text.
   * If undefined, Tinky may fall back to a default width (e.g., 80).
   */
  columns?: number;

  /**
   * Number of rows in the terminal.
   *
   * @remarks
   * This property is used by Tinky to handle clearing the screen or scrolling.
   */
  rows?: number;

  /**
   * Register an event listener.
   *
   * @param event - The event name (e.g., 'resize').
   * @param listener - The callback function.
   * @returns The stream instance for chaining.
   */
  on?(event: string, listener: (...args: unknown[]) => void): this;

  /**
   * Remove an event listener.
   *
   * @param event - The event name.
   * @param listener - The callback function to remove.
   * @returns The stream instance for chaining.
   */
  off?(event: string, listener: (...args: unknown[]) => void): this;
}

/**
 * Interface representing a readable stream (e.g., stdin).
 * This abstracts away Node.js's ReadStream to make Tinky environment-agnostic.
 *
 * @remarks
 * This interface handles input events, primarily for keyboard interaction.
 *
 * @example
 * ```typescript
 * const myStdin: ReadStream = {
 *   isTTY: true
 * };
 * ```
 */
export interface ReadStream {
  /**
   * Sets the stream to raw mode.
   *
   * @remarks
   * Raw mode is required for Tinky to receive character-by-character input
   * without waiting for Enter to be pressed.
   *
   * @param mode - `true` to enable raw mode, `false` to disable.
   * @returns The stream instance.
   */
  setRawMode?(mode: boolean): this;

  /**
   * Register an event listener.
   *
   * @param event - The event name (e.g., 'data').
   * @param listener - The callback function.
   * @returns The stream instance.
   */
  on?(event: string, listener: (...args: unknown[]) => void): this;

  /**
   * Remove an event listener.
   *
   * @param event - The event name.
   * @param listener - The callback function.
   * @returns The stream instance.
   */
  off?(event: string, listener: (...args: unknown[]) => void): this;

  /**
   * Indicates whether the stream is a TTY (Terminal).
   */
  isTTY?: boolean;

  /**
   * Sets the character encoding for data read from the stream.
   *
   * @param encoding - The encoding to use (e.g., 'utf8').
   */
  setEncoding?(encoding: string): void;

  /**
   * Keeps the process alive as long as the stream is active.
   */
  ref?(): void;

  /**
   * Allows the process to exit even if the stream is active.
   */
  unref?(): void;
}
