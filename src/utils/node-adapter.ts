import { type ReadStream, type WriteStream } from "../types/io.js";

interface GlobalWithProcess {
  process?: {
    stdout?: WriteStream;
    stderr?: WriteStream;
    stdin?: ReadStream;
    env?: Record<string, string | undefined>;
    exit?: (code?: number) => void;
    on?: (event: string, listener: (...args: unknown[]) => void) => void;
    platform?: string;
    cwd?: () => string;
  };
}

/**
 * Interface for the subset of Node.js `fs` module used by Tinky.
 */
export interface Fs {
  existsSync(path: string): boolean;
  readFileSync(path: string, encoding: "utf8"): string;
}

export const process = (globalThis as unknown as GlobalWithProcess)?.process;
export const fs = (globalThis as unknown as { fs: Fs })?.fs;
