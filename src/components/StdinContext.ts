import { EventEmitter } from "node:events";
import process from "node:process";
import { createContext } from "react";

/**
 * Props for the StdinContext.
 */
export interface StdinProps {
  /**
   * The stdin stream passed to `render()` in `options.stdin`, or
   * `process.stdin` by default. Useful if your app needs to handle user input.
   */
  readonly stdin: NodeJS.ReadStream;

  /**
   * Tinky exposes this function via own `<StdinContext>` to handle Ctrl+C,
   * so use Tinky's `setRawMode` instead of `process.stdin.setRawMode`. If the
   * `stdin` stream passed to Tinky doesn't support setRawMode, this does
   * nothing.
   */
  readonly setRawMode: (value: boolean) => void;

  /**
   * A boolean flag determining if the current `stdin` supports `setRawMode`.
   * A component using `setRawMode` might want to use `isRawModeSupported` to
   * nicely fall back in environments where raw mode is not supported.
   */
  readonly isRawModeSupported: boolean;

  /**
   * Internal flag to check if exit on Ctrl+C is enabled.
   */
  readonly internal_exitOnCtrlC: boolean;

  /**
   * Internal event emitter for handling input events.
   */
  readonly internal_eventEmitter: EventEmitter;
}

/**
 * `StdinContext` is a React context that exposes the input stream.
 */
export const StdinContext = createContext<StdinProps>({
  stdin: process.stdin,
  internal_eventEmitter: new EventEmitter(),
  setRawMode() {
    // no-op
  },
  isRawModeSupported: false,
  internal_exitOnCtrlC: true,
});

StdinContext.displayName = "InternalStdinContext";
