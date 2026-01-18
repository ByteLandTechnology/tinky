import { PureComponent, type ReactNode } from "react";
import * as cliCursor from "../utils/cli-cursor.js";
import { AppContext } from "../contexts/AppContext.js";
import { StdinContext } from "../contexts/StdinContext.js";
import { StdoutContext } from "../contexts/StdoutContext.js";
import { StderrContext } from "../contexts/StderrContext.js";
import { FocusContext } from "../contexts/FocusContext.js";
import { ErrorOverview } from "./ErrorOverview.js";
import { type ReadStream, type WriteStream } from "../types/io.js";
import { EventEmitter } from "../utils/event-emitter.js";

const tab = "\t";
const shiftTab = "\u001B[Z";
const escape = "\u001B";

/**
 * Props for the App component.
 */
interface AppProps {
  /**
   * The child components to render.
   */
  readonly children: ReactNode;

  /**
   * input stream.
   */
  readonly stdin: ReadStream;

  /**
   * output stream.
   */
  readonly stdout: WriteStream;

  /**
   * error stream.
   */
  readonly stderr: WriteStream;

  /**
   * Function to write data to stdout.
   */
  readonly writeToStdout: (data: string) => void;

  /**
   * Function to write data to stderr.
   */
  readonly writeToStderr: (data: string) => void;

  /**
   * Whether to exit on Ctrl+C.
   */
  readonly exitOnCtrlC: boolean;

  /**
   * Callback called when the app exits.
   */
  readonly onExit: (error?: Error) => void;
}

/**
 * State for the App component.
 */
interface State {
  /**
   * Whether focus management is enabled.
   */
  readonly isFocusEnabled: boolean;

  /**
   * The ID of the currently focused component.
   */
  readonly activeFocusId?: string;

  /**
   * List of focusable components.
   */
  readonly focusables: Focusable[];

  /**
   * Current error, if any.
   */
  readonly error?: Error;
}

/**
 * Represents a focusable component.
 */
interface Focusable {
  /**
   * Unique ID of the component.
   */
  readonly id: string;

  /**
   * Whether the component is active (focusable).
   */
  readonly isActive: boolean;
}

/**
 * Root component for all Tinky apps.
 *
 * It renders stdin, stdout, and stderr contexts, making them available to
 * children. It coordinates focus management and global error handling.
 * It also handles Ctrl+C exiting and cursor visibility.
 */
export class App extends PureComponent<AppProps, State> {
  static displayName = "InternalApp";

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  override state = {
    isFocusEnabled: true,
    activeFocusId: undefined,
    focusables: [],
    error: undefined,
  };

  // Count how many components enabled raw mode to avoid disabling
  // raw mode until all components don't need it anymore
  rawModeEnabledCount = 0;
  internal_eventEmitter = new EventEmitter();

  // Determines if TTY is supported on the provided stdin
  isRawModeSupported(): boolean {
    return !!this.props.stdin.isTTY;
  }

  override render() {
    return (
      <AppContext.Provider
        value={{
          exit: this.handleExit,
        }}
      >
        <StdinContext.Provider
          value={{
            stdin: this.props.stdin,
            setRawMode: this.handleSetRawMode,
            isRawModeSupported: this.isRawModeSupported(),
            internal_exitOnCtrlC: this.props.exitOnCtrlC,
            internal_eventEmitter: this.internal_eventEmitter,
          }}
        >
          <StdoutContext.Provider
            value={{
              stdout: this.props.stdout,
              write: this.props.writeToStdout,
            }}
          >
            <StderrContext.Provider
              value={{
                stderr: this.props.stderr,
                write: this.props.writeToStderr,
              }}
            >
              <FocusContext.Provider
                value={{
                  activeId: this.state.activeFocusId,
                  add: this.addFocusable,
                  remove: this.removeFocusable,
                  activate: this.activateFocusable,
                  deactivate: this.deactivateFocusable,
                  enableFocus: this.enableFocus,
                  disableFocus: this.disableFocus,
                  focusNext: this.focusNext,
                  focusPrevious: this.focusPrevious,
                  focus: this.focus,
                }}
              >
                {this.state.error ? (
                  <ErrorOverview error={this.state.error as Error} />
                ) : (
                  this.props.children
                )}
              </FocusContext.Provider>
            </StderrContext.Provider>
          </StdoutContext.Provider>
        </StdinContext.Provider>
      </AppContext.Provider>
    );
  }

  override componentDidMount() {
    cliCursor.hide(this.props.stdout);
  }

  override componentWillUnmount() {
    cliCursor.show(this.props.stdout);

    // ignore calling setRawMode on an handle stdin it cannot be called
    if (this.isRawModeSupported()) {
      this.handleSetRawMode(false);
    }
  }

  override componentDidCatch(error: Error) {
    this.handleExit(error);
  }

  /**
   * Enables or disables raw mode on the input stream.
   *
   * @param isEnabled - true to enable raw mode, false to disable.
   */
  handleSetRawMode = (isEnabled: boolean): void => {
    const { stdin } = this.props;

    if (!this.isRawModeSupported()) {
      throw new Error(
        "Raw mode is not supported on the stdin provided to Tinky.",
      );
    }

    stdin.setEncoding?.("utf8");

    if (isEnabled) {
      // Ensure raw mode is enabled only once
      if (this.rawModeEnabledCount === 0) {
        stdin.ref?.();

        stdin.setRawMode(true);
        stdin.on("data", this.handleReadable);
      }

      this.rawModeEnabledCount++;
      return;
    }

    // Disable raw mode only when no components left that are using it
    if (--this.rawModeEnabledCount === 0) {
      stdin.setRawMode(false);
      stdin.off("data", this.handleReadable);
      stdin.unref?.();
    }
  };

  /**
   * Reader function for handling standard input.
   * Reads data from stdin and emits it to the internal event emitter.
   */
  handleReadable = (chunk: unknown): void => {
    const input = String(chunk);
    this.handleInput(input);
    this.internal_eventEmitter.emit("input", input);
  };

  /**
   * Handles keyboard input.
   * - Handles Ctrl+C for exiting.
   * - Handles Tab/Shift+Tab for focus navigation.
   * - Handles Esc for resetting focus.
   */
  handleInput = (input: string): void => {
    // Exit on Ctrl+C
    if (input === "\x03" && this.props.exitOnCtrlC) {
      this.handleExit();
    }

    // Reset focus when there's an active focused component on Esc
    if (input === escape && this.state.activeFocusId) {
      this.setState({
        activeFocusId: undefined,
      });
    }

    if (this.state.isFocusEnabled && this.state.focusables.length > 0) {
      if (input === tab) {
        this.focusNext();
      }

      if (input === shiftTab) {
        this.focusPrevious();
      }
    }
  };

  /**
   * Handles app exit.
   * Cleans up raw mode and calls the onExit prop.
   */
  handleExit = (error?: Error): void => {
    if (this.isRawModeSupported()) {
      this.handleSetRawMode(false);
    }

    this.props.onExit(error);
  };

  /**
   * Enables focus management.
   */
  enableFocus = (): void => {
    this.setState({
      isFocusEnabled: true,
    });
  };

  /**
   * Disables focus management.
   */
  disableFocus = (): void => {
    this.setState({
      isFocusEnabled: false,
    });
  };

  /**
   * Focuses a component by its ID.
   */
  focus = (id: string): void => {
    this.setState((previousState) => {
      const hasFocusableId = previousState.focusables.some(
        (focusable) => focusable?.id === id,
      );

      if (!hasFocusableId) {
        return previousState;
      }

      return { activeFocusId: id };
    });
  };

  /**
   * Focuses the next focusable component.
   */
  focusNext = (): void => {
    this.setState((previousState) => {
      const firstFocusableId = previousState.focusables.find(
        (focusable) => focusable.isActive,
      )?.id;
      const nextFocusableId = this.findNextFocusable(previousState);

      return {
        activeFocusId: nextFocusableId ?? firstFocusableId,
      };
    });
  };

  /**
   * Focuses the previous focusable component.
   */
  focusPrevious = (): void => {
    this.setState((previousState) => {
      const lastFocusableId = previousState.focusables.findLast(
        (focusable) => focusable.isActive,
      )?.id;
      const previousFocusableId = this.findPreviousFocusable(previousState);

      return {
        activeFocusId: previousFocusableId ?? lastFocusableId,
      };
    });
  };

  /**
   * Registers a component as focusable.
   */
  addFocusable = (id: string, { autoFocus }: { autoFocus: boolean }): void => {
    this.setState((previousState) => {
      let nextFocusId = previousState.activeFocusId;

      if (!nextFocusId && autoFocus) {
        nextFocusId = id;
      }

      return {
        activeFocusId: nextFocusId,
        focusables: [
          ...previousState.focusables,
          {
            id,
            isActive: true,
          },
        ],
      };
    });
  };

  /**
   * Unregisters a focusable component.
   */
  removeFocusable = (id: string): void => {
    this.setState((previousState) => ({
      activeFocusId:
        previousState.activeFocusId === id
          ? undefined
          : previousState.activeFocusId,
      focusables: previousState.focusables.filter((focusable) => {
        return focusable.id !== id;
      }),
    }));
  };

  /**
   * Activates a focusable component (makes it eligible for focus).
   */
  activateFocusable = (id: string): void => {
    this.setState((previousState) => ({
      focusables: previousState.focusables.map((focusable) => {
        if (focusable.id !== id) {
          return focusable;
        }

        return {
          id,
          isActive: true,
        };
      }),
    }));
  };

  /**
   * Deactivates a focusable component (makes it ineligible for focus).
   */
  deactivateFocusable = (id: string): void => {
    this.setState((previousState) => ({
      activeFocusId:
        previousState.activeFocusId === id
          ? undefined
          : previousState.activeFocusId,
      focusables: previousState.focusables.map((focusable) => {
        if (focusable.id !== id) {
          return focusable;
        }

        return {
          id,
          isActive: false,
        };
      }),
    }));
  };

  /**
   * Finds the next focusable component ID.
   */
  findNextFocusable = (state: State): string | undefined => {
    const activeIndex = state.focusables.findIndex((focusable) => {
      return focusable.id === state.activeFocusId;
    });

    for (
      let index = activeIndex + 1;
      index < state.focusables.length;
      index++
    ) {
      const focusable = state.focusables[index];

      if (focusable?.isActive) {
        return focusable.id;
      }
    }

    return undefined;
  };

  /**
   * Finds the previous focusable component ID.
   */
  findPreviousFocusable = (state: State): string | undefined => {
    const activeIndex = state.focusables.findIndex((focusable) => {
      return focusable.id === state.activeFocusId;
    });

    for (let index = activeIndex - 1; index >= 0; index--) {
      const focusable = state.focusables[index];

      if (focusable?.isActive) {
        return focusable.id;
      }
    }

    return undefined;
  };
}
