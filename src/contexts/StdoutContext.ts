import { createContext } from "react";
import { type WriteStream } from "../types/io.js";
import { emptyStream } from "../utils/empty-stream.js";
import { process } from "../utils/node-adapter.js";

/**
 * Props for StdoutContext.
 */
export interface StdoutProps {
  /**
   * Stdout stream passed to `render()` in `options.stdout` or
   * `process.stdout` by default.
   */
  readonly stdout: WriteStream;

  /**
   * Write any string to stdout while preserving Tinky's output. It's useful
   * when you want to display external information outside of Tinky's rendering
   * and ensure there's no conflict. It's similar to `<Static>`, but can't
   * accept components; it only works with strings.
   */
  readonly write: (data: string) => void;
}

/**
 * `StdoutContext` is a React context that exposes the stdout stream where
 * Tinky renders your app.
 */
export const StdoutContext = createContext<StdoutProps>({
  stdout: process?.stdout || emptyStream,
  write() {
    // no-op
  },
});

StdoutContext.displayName = "InternalStdoutContext";
