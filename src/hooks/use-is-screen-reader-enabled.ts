import { useContext } from "react";
import { AccessibilityContext } from "../contexts/AccessibilityContext.js";

/**
 * Returns whether a screen reader is enabled. This is useful when you want to
 * render different output for screen readers.
 *
 * @returns true if screen reader is enabled, false otherwise.
 */
export const useIsScreenReaderEnabled = (): boolean => {
  const { isScreenReaderEnabled } = useContext(AccessibilityContext);
  return isScreenReaderEnabled;
};
