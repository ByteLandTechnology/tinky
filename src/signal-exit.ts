import process from "node:process";
import { onExit as onSignalExit } from "signal-exit";

/**
 * Registers a callback to be executed when the process exits or on signal.
 *
 * @param callback - The function to call on exit.
 * @param options - Configuration options.
 * @param options.alwaysLast - Ensures callback runs after other exit handlers.
 * @returns A function to unsubscribe the exit listener.
 */
export function onExit(
  callback: (code?: number | null, signal?: NodeJS.Signals | null) => void,
  options?: { alwaysLast?: boolean },
): () => void {
  const unsubscribeSignalExit = onSignalExit(callback, options);

  // Polyfill for Bun: signal-exit does not seem to catch the 'exit' event
  // in this specific test environment, so we attach a manual listener
  // to ensure the final render frame is output.
  const onProcessExit = (code: number) => {
    callback(code, null);
  };

  process.on("exit", onProcessExit);

  return () => {
    unsubscribeSignalExit();
    process.off("exit", onProcessExit);
  };
}
