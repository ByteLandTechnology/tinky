import EventEmitter from "node:events";

/**
 * Fake process.stdout for testing.
 * Captures all output written to it.
 */
type FakeStdout = {
  /**
   * Returns the output from the last call to write.
   */
  get: () => string;

  /**
   * Returns the output from the first call to write.
   */
  firstCall: () => string;

  /**
   * Returns the output from the second call to write.
   */
  secondCall: () => string;

  /**
   * Returns the total number of calls to write.
   */
  callCount: () => number;

  /**
   * Contains all the output that was written to stdout as a single string.
   */
  output: string;
} & NodeJS.WriteStream;

/**
 * Creates a mocked stdout stream for capturing output.
 *
 * @param columns - Number of columns in the fake terminal. Default is 100.
 * @param isTTY - Whether the stream should behave like a TTY. Default is true.
 * @returns A fake stdout object.
 */
export const createStdout = (columns?: number, isTTY?: boolean): FakeStdout => {
  const stdout = new EventEmitter() as unknown as FakeStdout;
  stdout.columns = columns ?? 100;
  // Default to 24 rows, similar to a standard terminal
  stdout.rows = 24;
  stdout.isTTY = isTTY ?? true;

  const frames: string[] = [];
  const calls: { args: [string] }[] = [];

  const write = (str: string) => {
    frames.push(str);
    calls.push({ args: [str] });
    return true;
  };

  stdout.write = (str: string) => {
    // Ignore cursor hide/show sequences
    if (str === "\x1B[?25l" || str === "\x1B[?25h") {
      return true;
    }

    return write(str);
  };

  stdout.get = () => (calls[calls.length - 1]?.args[0] as string) || "";
  stdout.firstCall = () => (calls[0]?.args[0] as string) || "";
  stdout.secondCall = () => (calls[1]?.args[0] as string) || "";
  stdout.callCount = () => calls.length;

  Object.defineProperty(stdout, "output", {
    get: () => frames.join(""),
  });

  return stdout;
};
