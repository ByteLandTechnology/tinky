import { useContext } from "react";
import { StdoutContext } from "../components/StdoutContext.js";

/**
 * `useStdout` is a React hook that exposes the stdout stream where Tinky
 * renders your app.
 *
 * @returns The stdout context.
 * @returns {NodeJS.WriteStream} stdout.stdout - Stdout stream passed to
 *   `render()` in `options.stdout` or `process.stdout` by default.
 * @returns {function(data: string): void} stdout.write - Write any string to
 *   stdout while preserving Tinky's output. Similar to `<Static>`, but only
 *   works with strings.
 */
export const useStdout = (): {
  /**
   * Stdout stream passed to `render()` in `options.stdout` or `process.stdout`
   * by default.
   */
  readonly stdout: NodeJS.WriteStream;
  /**
   * Write any string to stdout while preserving Tinky's output. Similar to
   * `<Static>`, but only works with strings.
   */
  readonly write: (data: string) => void;
} => useContext(StdoutContext);
