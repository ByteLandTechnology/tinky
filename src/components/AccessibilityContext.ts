import { createContext } from "react";

/**
 * Context to manage accessibility settings, specifically screen reader support.
 */
export const AccessibilityContext = createContext({
  /**
   * Whether the screen reader is enabled.
   */
  isScreenReaderEnabled: false,
});
