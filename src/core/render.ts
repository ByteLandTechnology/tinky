import { type ReactNode } from "react";
import { type ReadStream, type WriteStream } from "../types/io.js";
import {
  Tinky,
  type Options as TinkyOptions,
  type RenderMetrics,
} from "./tinky.js";
import { instances } from "./instances.js";
import { process } from "../utils/node-adapater.js";
import { emptyStream } from "../utils/empty-stream.js";

/**
 * Options for the render function.
 */
export interface RenderOptions {
  /**
   * Output stream where the app will be rendered.
   *
   * @defaultValue process.stdout
   */
  stdout?: WriteStream;

  /**
   * Input stream where the app will listen for input.
   *
   * @defaultValue process.stdin
   */
  stdin?: ReadStream;

  /**
   * Error stream.
   *
   * @defaultValue process.stderr
   */
  stderr?: WriteStream;

  /**
   * If true, each update will be rendered as separate output, without
   * replacing.
   *
   * @defaultValue false
   */
  debug?: boolean;

  /**
   * Configure whether Tinky should listen for Ctrl+C keyboard input and exit.
   * This is needed in raw mode, where Ctrl+C is ignored by default.
   *
   * @defaultValue true
   */
  exitOnCtrlC?: boolean;

  /**
   * Patch console methods to ensure console output doesn't mix with Tinky's.
   *
   * @defaultValue true
   */
  patchConsole?: boolean;

  /**
   * runs the given callback after each render and re-render.
   *
   * @param metrics - Performance metrics of the render.
   */
  onRender?: (metrics: RenderMetrics) => void;

  /**
   * Enable screen reader support.
   *
   * @defaultValue process.env['TINKY_SCREEN_READER'] === 'true'
   */
  isScreenReaderEnabled?: boolean;

  /**
   * Maximum frames per second for render updates.
   * Controls how frequently UI can update to prevent excessive re-rendering.
   * Higher values allow more frequent updates but may impact performance.
   *
   * @defaultValue 30
   */
  maxFps?: number;

  /**
   * Enable incremental rendering mode which only updates changed lines instead
   * of redrawing the entire output. Reduces flickering and improves
   * performance.
   *
   * @defaultValue false
   */
  incrementalRendering?: boolean;

  /**
   * Environment variables.
   *
   * @defaultValue process.env
   */
  env?: Record<string, string | undefined>;
}

/**
 * Interface for the Tinky instance returned by render.
 */
export interface Instance {
  /**
   * Replace the previous root node with a new one or update props of current
   * root.
   *
   * @param node - The new React node to render.
   */
  rerender: Tinky["render"];

  /**
   * Manually unmount the whole Tinky app.
   *
   * @param error - Optional error or exit code.
   */
  unmount: Tinky["unmount"];

  /**
   * Returns a promise that resolves when the app is unmounted.
   *
   * @returns A promise that resolves when the app is unmounted.
   */
  waitUntilExit: Tinky["waitUntilExit"];

  /**
   * Cleanup the instance from the instances map.
   */
  cleanup: () => void;

  /**
   * Clear output.
   */
  clear: () => void;
}

/**
 * Mount a component and render the output.
 *
 * @param node - The React component to render.
 * @param options - Render options or the stdout stream.
 * @returns The Tinky instance.
 *
 * @example
 * ```tsx
 * import { render, Text } from 'tinky';
 *
 * render(<Text>Hello World</Text>);
 * ```
 *
 * @example
 * ```tsx
 * import { render, Text } from 'tinky';
 *
 * const {unmount} = render(<Text>Hello World</Text>);
 *
 * setTimeout(() => {
 *   unmount();
 * }, 1000);
 * ```
 */
export const render = (node: ReactNode, options?: RenderOptions): Instance => {
  const tinkyOptions: TinkyOptions = {
    stdout: process?.stdout || emptyStream,
    stdin: process?.stdin || emptyStream,
    stderr: process?.stderr || emptyStream,
    debug: false,
    exitOnCtrlC: true,
    patchConsole: true,
    maxFps: 30,
    incrementalRendering: false,
    env: process?.env,
    ...options,
  };

  const instance: Tinky = getInstance(
    tinkyOptions.stdout,
    () => new Tinky(tinkyOptions),
  );

  instance.render(node);

  return {
    rerender: instance.render,
    unmount() {
      instance.unmount();
    },
    waitUntilExit: instance.waitUntilExit,
    cleanup: () => instances.delete(tinkyOptions.stdout),
    clear: instance.clear,
  };
};

/**
 * Gets or creates a Tinky instance for the given stdout stream.
 *
 * @param stdout - The stdout stream.
 * @param createInstance - A function to create a new Tinky instance if one
 *   doesn't exist.
 * @returns The Tinky instance.
 */
const getInstance = (
  stdout: WriteStream,
  createInstance: () => Tinky,
): Tinky => {
  let instance = instances.get(stdout);

  if (!instance) {
    instance = createInstance();
    instances.set(stdout, instance);
  }

  return instance;
};
