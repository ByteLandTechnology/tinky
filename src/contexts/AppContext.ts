import { createContext } from "react";

/**
 * Props for the AppContext.
 */
export interface AppProps {
  /**
   * Exit (unmount) the whole Tinky app.
   */
  readonly exit: (error?: Error) => void;

  /**
   * The platform the app is running on.
   */
  readonly platform?: string;

  /**
   * Environment variables.
   */
  readonly env?: Record<string, string | undefined>;
}

/**
 * `AppContext` is a React context that exposes a method to manually exit the
 * app (unmount).
 */
export const AppContext = createContext<AppProps>({
  exit() {
    // no-op
  },
});

AppContext.displayName = "InternalAppContext";
