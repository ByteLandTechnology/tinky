import process from "node:process";
import { createContext } from "react";

/**
 * Props for StderrContext.
 */
export interface StderrProps {
  /**
   * Stderr stream passed to `render()` in `options.stderr` or `process.stderr`
   * by default.
   */
  readonly stderr: NodeJS.WriteStream;

  /**
   * Write any string to stderr while preserving Tinky's output. It's useful
   * when you want to display external information outside of Tinky's rendering
   * and ensure there's no conflict. It's similar to `<Static>`, but can't
   * accept components; it only works with strings.
   */
  readonly write: (data: string) => void;
}

/**
 * `StderrContext` is a React context that exposes the stderr stream.
 */
export const StderrContext = createContext<StderrProps>({
  stderr: process.stderr,
  write() {
    // no-op
  },
});

StderrContext.displayName = "InternalStderrContext";
