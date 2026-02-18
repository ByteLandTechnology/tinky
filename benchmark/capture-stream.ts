import { Writable } from "node:stream";
import stripAnsi from "strip-ansi";
import { type CaptureMetrics } from "./types.js";

interface CaptureStreamOptions {
  readonly columns: number;
  readonly rows: number;
}

const utf8Length = (value: string): number => Buffer.byteLength(value, "utf8");

const chunkToString = (chunk: unknown): string => {
  if (typeof chunk === "string") {
    return chunk;
  }

  if (Buffer.isBuffer(chunk)) {
    return chunk.toString("utf8");
  }

  if (chunk instanceof Uint8Array) {
    return Buffer.from(chunk).toString("utf8");
  }

  return String(chunk);
};

export class CaptureStream extends Writable {
  readonly isTTY = true;
  readonly fd = 1;
  columns: number;
  rows: number;
  readonly writes: string[] = [];

  private totalBytes = 0;
  private visibleBytes = 0;
  private writeCalls = 0;

  constructor(options: CaptureStreamOptions) {
    super({ decodeStrings: false });
    this.columns = options.columns;
    this.rows = options.rows;
  }

  override _write(
    chunk: string | Uint8Array,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    const text = chunkToString(chunk);

    this.writes.push(text);
    this.totalBytes += utf8Length(text);
    this.visibleBytes += utf8Length(stripAnsi(text));
    this.writeCalls += 1;
    callback(null);
  }

  resetCounters(): void {
    this.totalBytes = 0;
    this.visibleBytes = 0;
    this.writeCalls = 0;
    this.writes.length = 0;
  }

  snapshot(): CaptureMetrics {
    const ansiBytes = Math.max(0, this.totalBytes - this.visibleBytes);

    return {
      totalBytes: this.totalBytes,
      visibleBytes: this.visibleBytes,
      ansiBytes,
      writeCalls: this.writeCalls,
      writes: [...this.writes],
    };
  }

  getColorDepth(): number {
    return 24;
  }

  hasColors(): boolean {
    return true;
  }

  cursorTo(): boolean {
    return true;
  }

  moveCursor(): boolean {
    return true;
  }

  clearLine(): boolean {
    return true;
  }

  clearScreenDown(): boolean {
    return true;
  }
}
