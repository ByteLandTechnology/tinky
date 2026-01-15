import process from "node:process";
import { createContext } from "react";

/**
 * Props for StdoutContext.
 */
export interface StdoutProps {
  /**
   * Stdout stream passed to `render()` in `options.stdout` or
   * `process.stdout` by default.
   */
  readonly stdout: NodeJS.WriteStream;

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
  stdout: process.stdout,
  write() {
    // no-op
  },
});

StdoutContext.displayName = "InternalStdoutContext";
