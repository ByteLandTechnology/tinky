import { type ReactNode } from "react";
import { throttle } from "es-toolkit/compat";
import ansiEscapes from "../utils/ansi-escapes.js";
import { isCI } from "../utils/check-ci.js";
import autoBind from "auto-bind";
import { onExit } from "../utils/signal-exit.js";
import { patchConsole } from "../utils/patch-console.js";
import { LegacyRoot } from "react-reconciler/constants.js";
import { type FiberRoot } from "react-reconciler";
import { type AvailableSpace, type Size } from "taffy-layout";
import wrapAnsi from "wrap-ansi";
import { type ReadStream, type WriteStream } from "../types/io.js";
import { reconciler } from "./reconciler.js";
import { renderer } from "./renderer.js";
import { cellRenderer } from "./cell-renderer.js";
import * as dom from "./dom.js";
import { logUpdate, type LogUpdate } from "./log-update.js";
import {
  cellLogUpdateRun,
  type CellLogUpdateRender,
} from "./cell-log-update-run.js";
import { instances } from "./instances.js";
import { App } from "../components/App.js";
import { AccessibilityContext } from "../contexts/AccessibilityContext.js";
import { type TaffyNode } from "./taffy-node.js";
import { CellBuffer, StyleRegistry } from "./cell-buffer.js";
import {
  normalizeIncrementalRendering,
  type IncrementalRenderingOption,
} from "./incremental-rendering.js";

const noop = () => {
  // no-op
};

/**
 * Performance metrics for a render operation.
 */
export interface RenderMetrics {
  /**
   * Time spent rendering in milliseconds.
   */
  renderTime: number;
}

/**
 * Configuration options for the Tinky instance.
 */
export interface Options {
  /**
   * Output stream where the app will be rendered.
   */
  stdout: WriteStream;

  /**
   * Input stream where the app will listen for input.
   */
  stdin: ReadStream;

  /**
   * Error stream.
   */
  stderr: WriteStream;

  /**
   * If true, each update will be rendered as separate output, without
   * replacing the previous one.
   */
  debug: boolean;

  /**
   * Configure whether Tinky should listen for Ctrl+C keyboard input and exit.
   */
  exitOnCtrlC: boolean;

  /**
   * Patch console methods to ensure console output doesn't mix with Tinky's.
   */
  patchConsole: boolean;

  /**
   * Callback to run after each render and re-render.
   *
   * @param metrics - Performance metrics of the render.
   */
  onRender?: (metrics: RenderMetrics) => void;

  /**
   * Enable screen reader support.
   */
  isScreenReaderEnabled?: boolean;

  /**
   * Returns a promise that resolves when the app is unmounted.
   */
  waitUntilExit?: () => Promise<void>;

  /**
   * Maximum frames per second for render updates.
   * Controls how frequently UI can update to prevent excessive re-rendering.
   * Set to 0 or negative to disable throttling.
   */
  maxFps?: number;

  /**
   * Configure incremental rendering mode.
   *
   * - `true`: Enables run-diff incremental rendering.
   * - `false` or omitted: Disables incremental rendering.
   * - `{ enabled: false }`: Disables incremental rendering.
   * - `{ strategy: "line" }`: Enables line-diff incremental rendering.
   * - `{ strategy: "run" }` (or omitted strategy): Enables run-diff rendering.
   */
  incrementalRendering?: IncrementalRenderingOption;

  /**
   * Environment variables.
   */
  env?: Record<string, string | undefined>;
}

/**
 * Tinky core class responsible for managing the React tree rendering,
 * lifecycle, and terminal output.
 */
export class Tinky {
  /** Configuration options for this instance. */
  private readonly options: Options;
  /** Log update instance for output. */
  private readonly log: LogUpdate;
  /** Throttled log update instance for output. */
  private readonly throttledLog: LogUpdate;
  /** Whether screen reader support is enabled. */
  private readonly isScreenReaderEnabled: boolean;
  /** Whether the app has been unmounted. */
  private isUnmounted: boolean;
  /** Last output string that was rendered. */
  private lastOutput: string;
  /** Height of the last output in lines. */
  private lastOutputHeight: number;
  /** Width of the terminal at last render. */
  private lastTerminalWidth: number;
  /** React reconciler container. */
  private readonly container: FiberRoot;
  /** Root DOM element for the React tree. */
  private readonly rootNode: dom.DOMElement;
  /** Full static output for debug mode. */
  private fullStaticOutput: string;
  /** Promise that resolves when the app exits. */
  private exitPromise?: Promise<void>;
  /** Function to restore console after patching. */
  private restoreConsole?: () => void;
  /** Function to unsubscribe from resize events. */
  private readonly unsubscribeResize?: () => void;
  /** Whether we are running in a CI environment. */
  private readonly isCI: boolean;
  /** Whether run-diff incremental rendering is active for this instance. */
  private readonly usesRunIncrementalRendering: boolean;
  /** Run-diff log updater. */
  private readonly cellLog?: CellLogUpdateRender;
  /** Shared style registry for run buffers. */
  private readonly styleRegistry?: StyleRegistry;
  /** Previous rendered frame for run-diff strategy. */
  private frontBuffer?: CellBuffer;
  /** Current frame render target for run-diff strategy. */
  private backBuffer?: CellBuffer;

  /**
   * Creates an instance of Tinky.
   *
   * @param options - Configuration options.
   */
  constructor(options: Options) {
    autoBind(this);

    this.options = options;
    this.rootNode = dom.createNode("tinky-root");
    this.rootNode.onComputeLayout = this.calculateLayout;

    this.isScreenReaderEnabled =
      options.isScreenReaderEnabled ??
      options.env?.["TINKY_SCREEN_READER"] === "true";

    this.isCI = isCI(options.env);
    const incrementalRenderStrategy = normalizeIncrementalRendering(
      options.incrementalRendering,
    );
    // Run-diff uses cursor addressing and interactive frame tracking, so we keep
    // existing render paths in debug/screen-reader/CI modes.
    this.usesRunIncrementalRendering =
      incrementalRenderStrategy === "run" &&
      !options.debug &&
      !this.isScreenReaderEnabled &&
      !this.isCI;

    const useLineIncremental = incrementalRenderStrategy === "line";
    const unthrottled = options.debug || this.isScreenReaderEnabled;
    const maxFps = options.maxFps ?? 30;
    const renderThrottleMs =
      maxFps > 0 ? Math.max(1, Math.ceil(1000 / maxFps)) : 0;

    this.rootNode.onRender = unthrottled
      ? this.onRender
      : throttle(this.onRender, renderThrottleMs, {
          leading: true,
          trailing: true,
        });

    this.rootNode.onImmediateRender = this.onRender;
    this.log = logUpdate.create(options.stdout, {
      incremental: useLineIncremental,
    });
    this.throttledLog = unthrottled
      ? this.log
      : (throttle(this.log, undefined, {
          leading: true,
          trailing: true,
        }) as unknown as LogUpdate);

    if (this.usesRunIncrementalRendering) {
      this.styleRegistry = new StyleRegistry();
      this.frontBuffer = new CellBuffer(
        { width: 0, height: 0 },
        this.styleRegistry,
      );
      this.backBuffer = new CellBuffer(
        { width: 0, height: 0 },
        this.styleRegistry,
      );
      this.cellLog = cellLogUpdateRun.create(options.stdout, {
        incremental: true,
        mergeStrategy: "cost",
        maxSegmentsBeforeFullRow: 12,
        overwriteGapPenaltyBytes: 0,
      });
    }

    // Ignore last render after unmounting a tree to prevent empty output before
    // exit
    this.isUnmounted = false;

    // Store last output to only rerender when needed
    this.lastOutput = "";
    this.lastOutputHeight = 0;
    this.lastTerminalWidth = this.getTerminalWidth();

    // This variable is used only in debug mode to store full static output so
    // that it's rerendered every time, not just new static parts, like in
    // non-debug mode
    this.fullStaticOutput = "";

    this.container = reconciler.createContainer(
      this.rootNode,
      LegacyRoot,
      null,
      false,
      null,
      "id",
      noop,
      noop,
      noop,
      noop,
      null,
    );

    // Unmount when process exits
    this.unsubscribeExit = onExit(() => {
      this.unmount();
    });

    if (options.env?.["DEV"] === "true") {
      reconciler.injectIntoDevTools({
        bundleType: 0,
        // Reporting React DOM's version, not Tinky's
        version: "16.13.1",
        rendererPackageName: "tinky",
      });
    }

    if (this.options.patchConsole) {
      this.patchConsole();
    }

    if (!this.isCI) {
      options.stdout.on?.("resize", this.resized);

      this.unsubscribeResize = () => {
        options.stdout.off?.("resize", this.resized);
      };
    }
  }

  /**
   * Gets the terminal width.
   *
   * @returns The number of columns in the terminal, or 80 if undefined or 0.
   */
  getTerminalWidth = () => {
    // The 'columns' property can be undefined or 0 when not using a TTY.
    // In that case we fall back to 80.
    return this.options.stdout.columns || 80;
  };

  /**
   * Handles terminal resize events.
   * Clears the screen when width decreases to prevent overlapping re-renders.
   */
  resized = () => {
    const currentWidth = this.getTerminalWidth();

    if (currentWidth < this.lastTerminalWidth) {
      // We clear the screen when decreasing terminal width to prevent duplicate
      // overlapping re-renders.
      if (this.usesRunIncrementalRendering) {
        this.cellLog?.clear();
        this.frontBuffer?.resize(0, 0);
        this.frontBuffer?.clear();
      } else {
        this.log.clear();
      }
      this.lastOutput = "";
      this.lastOutputHeight = 0;
    }

    this.calculateLayout();
    this.onRender();

    this.lastTerminalWidth = currentWidth;
  };

  /** Resolves the exit promise when the app unmounts. */
  resolveExitPromise: () => void = noop;
  /** Rejects the exit promise with an error. */
  rejectExitPromise: (reason?: Error) => void = noop;
  /** Unsubscribes from the exit event. */
  unsubscribeExit: () => void = noop;

  /** Error that occurred during rendering, if any. */
  renderError: Error | null = null;

  /**
   * Calculates the layout of the UI (TaffyLayout).
   */
  calculateLayout = () => {
    if (this.rootNode.taffyNode === undefined) {
      return;
    }
    const terminalWidth = this.getTerminalWidth();
    const { tree } = this.rootNode.taffyNode;

    const rootStyle = tree.getStyle(this.rootNode.taffyNode.id);
    rootStyle.size = {
      width: terminalWidth,
      height: "auto",
    };
    tree.setStyle(this.rootNode.taffyNode.id, rootStyle);

    tree.computeLayoutWithMeasure(
      this.rootNode.taffyNode.id,
      {
        width: terminalWidth,
        height: "max-content",
      },
      (
        _knownDimensions: Size<number | undefined>,
        availableSpace: Size<AvailableSpace>,
        _node: bigint,
        context: TaffyNode,
      ) => {
        if (!context?.measureFunc) {
          return { width: 0, height: 0 };
        }

        return context.measureFunc(availableSpace.width);
      },
    );
  };

  /**
   * Performs the render operation.
   * Handles string generation, static output, screen reader logic, and writing.
   */
  onRender: () => void = () => {
    if (this.isUnmounted) {
      return;
    }

    if (this.usesRunIncrementalRendering && this.backBuffer) {
      const startTime = performance.now();
      const { buffer, outputHeight, staticOutput } = cellRenderer(
        this.rootNode,
        this.backBuffer,
        false,
      );

      this.options.onRender?.({ renderTime: performance.now() - startTime });

      const hasStaticOutput = staticOutput && staticOutput !== "\n";
      if (hasStaticOutput) {
        this.fullStaticOutput += staticOutput;
      }

      if (
        this.options.stdout.rows &&
        this.lastOutputHeight >= this.options.stdout.rows
      ) {
        const output = buffer.toString();
        this.options.stdout.write(
          ansiEscapes.clearTerminal + this.fullStaticOutput + output,
        );
        this.lastOutput = output;
        this.lastOutputHeight = outputHeight;
        this.cellLog?.sync(buffer);
        this.swapRunBuffers();
        return;
      }

      if (hasStaticOutput) {
        // Static output is appended once, then the interactive frame is redrawn.
        this.cellLog?.clear();
        this.options.stdout.write(staticOutput);
        if (this.frontBuffer && this.cellLog) {
          this.cellLog(this.frontBuffer, buffer, { forceFull: true });
          this.swapRunBuffers();
        }
      } else if (
        this.frontBuffer &&
        this.cellLog &&
        !this.isRunFrameEqual(buffer)
      ) {
        this.cellLog(this.frontBuffer, buffer);
        this.swapRunBuffers();
      }

      this.lastOutputHeight = outputHeight;
      return;
    }

    const startTime = performance.now();
    const { output, outputHeight, staticOutput } = renderer(
      this.rootNode,
      this.isScreenReaderEnabled,
    );

    this.options.onRender?.({ renderTime: performance.now() - startTime });

    // If <Static> output isn't empty, it means new children have been added to
    // it
    const hasStaticOutput = staticOutput && staticOutput !== "\n";

    if (this.options.debug) {
      if (hasStaticOutput) {
        this.fullStaticOutput += staticOutput;
      }

      this.options.stdout.write(this.fullStaticOutput + output);
      return;
    }

    if (this.isCI) {
      if (hasStaticOutput) {
        this.options.stdout.write(staticOutput);
      }

      this.lastOutput = output;
      this.lastOutputHeight = outputHeight;
      return;
    }

    if (this.isScreenReaderEnabled) {
      if (hasStaticOutput) {
        // We need to erase the main output before writing new static output
        const erase =
          this.lastOutputHeight > 0
            ? ansiEscapes.eraseLines(this.lastOutputHeight)
            : "";
        this.options.stdout.write(erase + staticOutput);
        // After erasing, the last output is gone, so we should reset its height
        this.lastOutputHeight = 0;
      }

      if (output === this.lastOutput && !hasStaticOutput) {
        return;
      }

      const terminalWidth = this.options.stdout.columns || 80;

      const wrappedOutput = wrapAnsi(output, terminalWidth, {
        trim: false,
        hard: true,
      });

      // If we haven't erased yet, do it now.
      if (hasStaticOutput) {
        this.options.stdout.write(wrappedOutput);
      } else {
        const erase =
          this.lastOutputHeight > 0
            ? ansiEscapes.eraseLines(this.lastOutputHeight)
            : "";
        this.options.stdout.write(erase + wrappedOutput);
      }

      this.lastOutput = output;
      this.lastOutputHeight =
        wrappedOutput === "" ? 0 : wrappedOutput.split("\n").length;
      return;
    }

    if (hasStaticOutput) {
      this.fullStaticOutput += staticOutput;
    }

    if (
      this.options.stdout.rows &&
      this.lastOutputHeight >= this.options.stdout.rows
    ) {
      this.options.stdout.write(
        ansiEscapes.clearTerminal + this.fullStaticOutput + output,
      );
      this.lastOutput = output;
      this.lastOutputHeight = outputHeight;
      this.log.sync(output);
      return;
    }

    // To ensure static output is cleanly rendered before main output, clear
    // main output first
    if (hasStaticOutput) {
      this.log.clear();
      this.options.stdout.write(staticOutput);
      this.log(output);
    }

    if (!hasStaticOutput && output !== this.lastOutput) {
      this.throttledLog(output);
    }

    this.lastOutput = output;
    this.lastOutputHeight = outputHeight;
  };

  private isRunFrameEqual(nextBuffer: CellBuffer): boolean {
    return this.frontBuffer?.isEqual(nextBuffer) ?? false;
  }

  /**
   * Swaps front and back buffers. After swap, the caller's newly-rendered
   * frame becomes the front buffer. The old front becomes the back buffer
   * and will be cleared by cellRenderer (resize + clear) at the start of
   * the next render cycle.
   */
  private swapRunBuffers() {
    const previous = this.frontBuffer;
    this.frontBuffer = this.backBuffer;
    this.backBuffer = previous;
  }

  private redrawRunBuffer() {
    if (!this.frontBuffer || !this.cellLog) {
      return;
    }

    this.cellLog(this.frontBuffer, this.frontBuffer, { forceFull: true });
    this.lastOutput = this.frontBuffer.toString();
    this.lastOutputHeight = this.frontBuffer.height;
  }

  /**
   * Renders the given React node.
   *
   * @param node - The React node to render.
   */
  render(node: ReactNode): void {
    const tree = (
      <AccessibilityContext.Provider
        value={{ isScreenReaderEnabled: this.isScreenReaderEnabled }}
      >
        <App
          stdin={this.options.stdin}
          stdout={this.options.stdout}
          stderr={this.options.stderr}
          writeToStdout={this.writeToStdout}
          writeToStderr={this.writeToStderr}
          exitOnCtrlC={this.options.exitOnCtrlC}
          onExit={this.unmount}
          env={this.options.env}
        >
          {node}
        </App>
      </AccessibilityContext.Provider>
    );

    reconciler.updateContainerSync(tree, this.container, null, noop);
    reconciler.flushSyncWork();
  }

  /**
   * Writes data to stdout.
   *
   * @param data - The data to write.
   */
  writeToStdout(data: string): void {
    if (this.isUnmounted) {
      return;
    }

    if (this.options.debug) {
      this.options.stdout.write(data + this.fullStaticOutput + this.lastOutput);
      return;
    }

    if (this.isCI) {
      this.options.stdout.write(data);
      return;
    }

    if (this.usesRunIncrementalRendering) {
      this.cellLog?.clear();
      this.options.stdout.write(data);
      this.redrawRunBuffer();
      return;
    }

    this.log.clear();
    this.options.stdout.write(data);
    this.log(this.lastOutput);
  }

  /**
   * Writes data to stderr.
   *
   * @param data - The data to write.
   */
  writeToStderr(data: string): void {
    if (this.isUnmounted) {
      return;
    }

    if (this.options.debug) {
      this.options.stderr.write(data);
      this.options.stdout.write(this.fullStaticOutput + this.lastOutput);
      return;
    }

    if (this.isCI) {
      this.options.stderr.write(data);
      return;
    }

    if (this.usesRunIncrementalRendering) {
      this.cellLog?.clear();
      this.options.stderr.write(data);
      this.redrawRunBuffer();
      return;
    }

    this.log.clear();
    this.options.stderr.write(data);
    this.log(this.lastOutput);
  }

  /**
   * Unmounts the Tinky app.
   *
   * @param error - Optional error object or exit code.
   */
  unmount(error?: Error | number | null): void {
    if (this.isUnmounted) {
      return;
    }

    // Store error for waitUntilExit() to check
    if (error instanceof Error) {
      this.renderError = error;
    }

    this.calculateLayout();
    this.onRender();
    this.unsubscribeExit();

    if (typeof this.restoreConsole === "function") {
      this.restoreConsole();
    }

    if (typeof this.unsubscribeResize === "function") {
      this.unsubscribeResize();
    }

    // CIs don't handle erasing ansi escapes well, so it's better to
    // only render last frame of non-static output
    if (this.isCI) {
      this.options.stdout.write(this.lastOutput + "\n");
    } else if (!this.options.debug) {
      if (this.usesRunIncrementalRendering) {
        this.cellLog?.done();
      } else {
        this.log.done();
      }
    }

    this.isUnmounted = true;

    reconciler.updateContainerSync(null, this.container, null, noop);
    reconciler.flushSyncWork();
    instances.delete(this.options.stdout);

    if (error instanceof Error) {
      this.rejectExitPromise(error);
    } else {
      this.resolveExitPromise();
    }
  }

  /**
   * Waits until the app exits.
   *
   * @returns A promise that resolves when the app exits.
   */
  async waitUntilExit(): Promise<void> {
    // If promise was already created, return it
    if (this.exitPromise) {
      return this.exitPromise;
    }

    // If an error occurred before waitUntilExit was called, reject immediately
    if (this.renderError) {
      return Promise.reject(this.renderError);
    }

    if (this.isUnmounted) {
      return Promise.resolve();
    }

    this.exitPromise = new Promise((resolve, reject) => {
      this.resolveExitPromise = resolve;
      this.rejectExitPromise = reject;
    });

    return this.exitPromise;
  }

  /**
   * Clears the output.
   */
  clear(): void {
    const isCiEnv = isCI(this.options.env);

    if (!isCiEnv) {
      if (this.usesRunIncrementalRendering) {
        this.cellLog?.clear();
      } else {
        this.log.clear();
      }
    }
  }

  /**
   * Patches console methods to ensure they coexist correctly with Tinky output.
   */
  patchConsole(): void {
    if (this.options.debug) {
      return;
    }

    this.restoreConsole = patchConsole((stream, args) => {
      const data = JSON.stringify(args);
      if (stream === "stdout") {
        this.writeToStdout(data);
      }

      if (stream === "stderr") {
        const isReactMessage = data.startsWith("The above error occurred");

        if (!isReactMessage) {
          this.writeToStderr(data);
        }
      }
    });
  }
}
