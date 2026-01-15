import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import Bun, { type FileSink } from "bun";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mockTtyPath = join(__dirname, "mock-tty.ts");

/**
 * Interface representing a simulated terminal.
 */
export interface Terminal {
  /**
   * Write input to the terminal's stdin.
   */
  write(input: string): void;

  /**
   * Get the current output of the terminal.
   */
  output: string;

  /**
   * Wait for the process to exit.
   */
  waitForExit: () => Promise<void>;
}

/**
 * Create a test process with its own terminal.
 * Best for tests that don't need to send input.
 *
 * @param fixture - The name of the fixture file to run.
 * @param args - Arguments to pass to the process.
 * @param options - Configuration options for the process environment.
 * @returns A Terminal object to interact with the process.
 */
export function term(
  fixture: string,
  args: string[] = [],
  options: { env?: Record<string, string>; columns?: number } = {},
): Terminal {
  let output = "";
  let proc: ReturnType<typeof Bun.spawn> | undefined;
  let fixtureStarted = false;
  const writeQueue: string[] = [];
  let stdoutPromise: Promise<void> | undefined;
  let stderrPromise: Promise<void> | undefined;

  const startFixture = () => {
    if (fixtureStarted) return;
    fixtureStarted = true;

    const fixturePath = join(__dirname, `../fixtures/${fixture}.tsx`);

    proc = Bun.spawn(["bun", "run", "-r", mockTtyPath, fixturePath, ...args], {
      env: {
        ...process.env,
        TERM: "xterm-256color",
        NODE_NO_WARNINGS: "1",
        CI: "false",
        FORCE_COLOR: "3",
        ...options.env,
      },
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
    });

    const reader = (proc.stdout as ReadableStream).getReader();
    const decoder = new TextDecoder();

    const stderrReader = (proc.stderr as ReadableStream).getReader();
    stderrPromise = (async () => {
      while (true) {
        const { done, value } = await stderrReader.read();
        if (done) break;
        output += decoder.decode(value);
      }
    })();
    stdoutPromise = (async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        output += decoder.decode(value);
      }
    })();

    // Process any queued writes after a delay to ensure Tinky is ready
    if (writeQueue.length > 0) {
      setTimeout(() => {
        for (const input of writeQueue) {
          if (proc?.stdin) {
            (proc.stdin as FileSink).write(input);
            (proc.stdin as FileSink).flush();
          }
        }
        writeQueue.length = 0;
      }, 500);
    }
  };

  return {
    get output() {
      return output;
    },
    write(input: string) {
      if (!fixtureStarted) {
        writeQueue.push(input);
        startFixture();
      } else if (proc?.stdin) {
        (proc.stdin as FileSink).write(input);
        (proc.stdin as FileSink).flush();
      }
    },
    waitForExit: async () => {
      if (!fixtureStarted) {
        startFixture();
      }

      if (proc) {
        await proc.exited;
        if (stdoutPromise) await stdoutPromise;
        if (stderrPromise) await stderrPromise;
      }
    },
  };
}

/**
 * Runs a fixture and returns its output.
 *
 * @param fixture - The name of the fixture to run.
 * @param props - Configuration properties.
 * @returns A promise that resolves to the process output.
 */
export async function run(
  fixture: string,
  props?: { args?: string[]; env?: Record<string, string>; columns?: number },
): Promise<string> {
  const args = props?.args || [];
  const { env, columns } = props || {};
  const ps = term(fixture, args, { env, columns });

  await ps.waitForExit();
  return ps.output;
}
