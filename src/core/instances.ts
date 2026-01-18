import { type Tinky } from "./tinky.js";
import { type WriteStream } from "../types/io.js";

/**
 * A WeakMap to store Tinky instances associated with their output streams.
 *
 * @remarks
 * This ensures that consecutive `render()` calls using the same output stream
 * reuse the existing Tinky instance instead of creating a new one. It uses a
 * WeakMap to allow garbage collection of unused streams.
 */
export const instances = new WeakMap<WriteStream, Tinky>();
