import mitt, { type Emitter, type Handler } from "mitt";

/**
 * A record type mapping event names to their payload types.
 * Used as the generic type parameter for the mitt emitter.
 */
export type Events = Record<string, unknown>;

/**
 * A minimal EventEmitter implementation using mitt.
 *
 * Provides a familiar Node.js-style EventEmitter API while using the
 * lightweight mitt library under the hood. This class is used internally
 * by Tinky for handling input events.
 *
 * @example
 * ```typescript
 * const emitter = new EventEmitter();
 *
 * // Register an event listener
 * emitter.on('data', (payload) => {
 *   console.log('Received:', payload);
 * });
 *
 * // Emit an event
 * emitter.emit('data', { key: 'value' });
 *
 * // Register a one-time listener
 * emitter.once('single', (payload) => {
 *   console.log('Called only once:', payload);
 * });
 * ```
 */
export class EventEmitter {
  /**
   * The underlying mitt emitter instance.
   */
  public emitter: Emitter<Events> = mitt<Events>();

  /**
   * Registers an event listener for the specified event.
   *
   * @param event - The name of the event to listen for.
   * @param fn - The handler function to call when the event is emitted.
   * @returns This EventEmitter instance for chaining.
   */
  on(event: string, fn: Handler<unknown>): this {
    this.emitter.on(event, fn);
    return this;
  }

  /**
   * Removes an event listener for the specified event.
   *
   * @param event - The name of the event to stop listening for.
   * @param fn - The handler function to remove.
   * @returns This EventEmitter instance for chaining.
   */
  off(event: string, fn: Handler<unknown>): this {
    this.emitter.off(event, fn);
    return this;
  }

  /**
   * Emits an event with optional data payload.
   *
   * @param event - The name of the event to emit.
   * @param data - Optional data payload to pass to the event handlers.
   * @returns Always returns `true` indicating the event was emitted.
   */
  emit(event: string, data?: unknown): boolean {
    this.emitter.emit(event, data);
    return true;
  }

  /**
   * Registers a one-time event listener that automatically removes itself
   * after being called once.
   *
   * @param event - The name of the event to listen for.
   * @param fn - The handler function to call when the event is emitted.
   * @returns This EventEmitter instance for chaining.
   */
  once(event: string, fn: Handler<unknown>): this {
    const on: Handler<unknown> = (data) => {
      this.off(event, on);
      fn(data);
    };
    this.on(event, on);
    return this;
  }
}
