import { type ReadStream, type WriteStream } from "../types/io.js";

export const emptyStream: WriteStream & ReadStream = {
  write: () => true,
  columns: 80,
  rows: 24,
  on: () => emptyStream,
  off: () => emptyStream,
  setRawMode: () => emptyStream,
  isTTY: false,
};
