import { EventEmitter } from "node:events";
import { spy, stub } from "sinon";

/**
 * Type representing a fake stdin stream for testing.
 * Combines EventEmitter, ReadableStream, and WriteStream capabilities.
 */
type FakeStdin = {
  /**
   * Emits a 'readable' event with the provided chunk as data.
   */
  emitReadable: (chunk: string) => void;

  /**
   * Returns the number of times setRawMode was called.
   */
  setRawModeCallCount: () => number;

  /**
   * Returns the arguments of the first call to setRawMode.
   */
  setRawModeFirstCallArgs: () => boolean[];

  /**
   * Returns the arguments of the last call to setRawMode.
   */
  setRawModeLastCallArgs: () => boolean[];

  /**
   * Returns the number of times ref was called.
   */
  refCallCount: () => number;

  /**
   * Returns the number of times unref was called.
   */
  unrefCallCount: () => number;
} & NodeJS.ReadStream &
  NodeJS.WriteStream;

/**
 * Creates a mocked stdin stream for testing input handling.
 *
 * @param isTTY - Whether the stream should behave like a TTY. Default is true.
 * @returns A fake stdin object with methods to simulate input.
 */
export function createStdin(isTTY?: boolean) {
  const stdin = new EventEmitter() as unknown as FakeStdin;
  const setRawMode = spy();
  const ref = spy();
  const unref = spy();
  const read = stub();

  stdin.emitReadable = (chunk: string) => {
    read.onCall(0).returns(chunk);
    read.onCall(1).returns(null);
    stdin.emit("readable");
    read.reset();
  };
  stdin.read = read;
  stdin.setEncoding = () => stdin;
  stdin.setRawMode = setRawMode;
  stdin.isTTY = isTTY ?? true;
  stdin.ref = ref;
  stdin.unref = unref;
  stdin.setRawModeCallCount = () => setRawMode.callCount;
  stdin.setRawModeFirstCallArgs = () => setRawMode.firstCall.args;
  stdin.setRawModeLastCallArgs = () => setRawMode.lastCall.args;
  stdin.refCallCount = () => ref.callCount;
  stdin.unrefCallCount = () => unref.callCount;
  return stdin;
}
