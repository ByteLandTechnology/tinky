import util from "util";

/**
 * Union type representing the standard output streams.
 */
type Stream = "stdout" | "stderr";

/**
 * Callback function to handle intercepted console output.
 *
 * @param stream - The stream the output is intended for ('stdout' or 'stderr').
 * @param data - The formatted string to be logged.
 */
type Callback = (stream: Stream, data: string) => void;

/**
 * Generic signature for a console method.
 * Uses `unknown` args for safety, avoiding `any`.
 */
type ConsoleMethod = (...args: unknown[]) => void;

/**
 * Interface defining which console methods belong to which stream.
 */
interface ConsoleMethods {
  /** Methods that should be directed to stdout. */
  stdout: (keyof Console)[];
  /** Methods that should be directed to stderr. */
  stderr: (keyof Console)[];
}

/**
 * List of console methods to patch, categorized by their target stream.
 */
const METHODS: ConsoleMethods = {
  stdout: [
    "log",
    "info",
    "dir",
    "dirxml",
    "table",
    "count",
    "countReset",
    "group",
    "groupCollapsed",
    "groupEnd",
    "time",
    "timeLog",
    "timeEnd",
    "debug",
  ],
  stderr: ["error", "warn", "trace", "assert"],
};

/**
 * Patches global console methods to intercept output and redirect it to a callback.
 *
 * This function wraps standard console methods (like `console.log`, `console.error`, etc.)
 * so that they call the provided callback instead of writing directly to the stream.
 * It uses `util.format` to format arguments exactly like the original console methods.
 *
 * @param callback - The function to call with the intercepted output.
 * @returns A function that restores the original console methods when called.
 *
 * @example
 * ```ts
 * const restore = patchConsole((stream, data) => {
 *   console.log(`[${stream}] ${data}`);
 * });
 *
 * console.log("Hello"); // Output: [stdout] Hello
 *
 * restore(); // Console is back to normal
 * ```
 */
export const patchConsole = (callback: Callback): (() => void) => {
  // Use ConsoleMethod to validly type the stored methods
  const originalMethods: Partial<Record<keyof Console, ConsoleMethod>> = {};

  const patch = (stream: Stream, method: keyof Console) => {
    // Cast console to a record of ConsoleMethods to allow index access without explicit any
    const consoleMethods = console as unknown as Record<
      keyof Console,
      ConsoleMethod
    >;
    originalMethods[method] = consoleMethods[method];

    consoleMethods[method] = (...args: unknown[]) => {
      // Handle console.assert specifically as it only outputs if assertion fails
      if (method === "assert") {
        if (!args[0]) {
          // Remove the assertion condition and format the rest
          callback(stream, util.format(...args.slice(1)));
        }
        return;
      }

      callback(stream, util.format(...args));
    };
  };

  for (const method of METHODS.stdout) {
    if (console[method]) {
      patch("stdout", method);
    }
  }

  for (const method of METHODS.stderr) {
    if (console[method]) {
      patch("stderr", method);
    }
  }

  return () => {
    // Cast console to a record of ConsoleMethods to restore original methods
    const consoleMethods = console as unknown as Record<
      keyof Console,
      ConsoleMethod
    >;
    for (const [method, original] of Object.entries(originalMethods)) {
      if (original) {
        consoleMethods[method as keyof Console] = original;
      }
    }
  };
};
