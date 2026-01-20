import { process } from "./node-adapter.js";

type Callback = (code?: number | null, signal?: string | null) => void;

// Track all registered listeners
const callbacks = new Set<Callback>();
let isAttached = false;

/**
 * Handles signal events by invoking all registered callbacks and then exiting.
 *
 * @param signal - The signal that triggered the exit.
 */
const handleSignal = (signal: unknown) => {
  for (const callback of callbacks) {
    callback(null, typeof signal === "string" ? signal : null);
  }

  // Restore default behavior: exit the process
  // We need to exit explicitly because adding a listener prevents the default exit
  process?.exit?.(128 + 1);
};

/**
 * Handles the 'exit' event by invoking all registered callbacks.
 *
 * @param code - The exit code.
 */
const handleExit = (code: number) => {
  for (const callback of callbacks) {
    callback(code, null);
  }
};

/**
 * Attaches the global event listeners if they haven't been attached yet.
 */
const attach = () => {
  if (isAttached) {
    return;
  }

  isAttached = true;

  process?.on?.("exit", handleExit as (...args: unknown[]) => void);
  process?.on?.("SIGINT", handleSignal);
  process?.on?.("SIGTERM", handleSignal);
  // SIGHUP is not supported on Windows, but safe to listen to on other platforms
  if (process?.platform !== "win32") {
    process?.on?.("SIGHUP", handleSignal);
  }
};

/**
 * Registers a callback to be executed when the process exits or receives a termination signal.
 *
 * This function is an internal replacement for the `signal-exit` library.
 * It ensures that the callback is executed when the process ends, whether naturally
 * or via signals like SIGINT (Ctrl+C).
 *
 * @param callback - The function to call on exit.
 * @param options - Configuration options.
 * @param options.alwaysLast - (Ignored in this simplified implementation) Ensures callback runs after other exit handlers.
 * @returns A function to unsubscribe the exit listener.
 */
export function onExit(callback: Callback): () => void {
  attach();
  callbacks.add(callback);

  return () => {
    callbacks.delete(callback);
  };
}
