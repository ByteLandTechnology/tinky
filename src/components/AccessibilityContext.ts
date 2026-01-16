import { createContext } from "react";

/**
 * Value type for the AccessibilityContext.
 */
export interface AccessibilityContextValue {
  /**
   * Whether the screen reader is enabled.
   *
   * @defaultValue false
   */
  readonly isScreenReaderEnabled: boolean;
}

/**
 * Context to manage accessibility settings, specifically screen reader.
 *
 * @example
 * ```tsx
 * import { useIsScreenReaderEnabled } from 'tinky';
 *
 * const Component = () => {
 *   const isScreenReaderEnabled = useIsScreenReaderEnabled();
 *
 *   if (isScreenReaderEnabled) {
 *     return <Text>Screen reader friendly output</Text>;
 *   }
 *
 *   return <Text>Regular output</Text>;
 * };
 * ```
 */
export const AccessibilityContext = createContext<AccessibilityContextValue>({
  /**
   * Whether the screen reader is enabled.
   */
  isScreenReaderEnabled: false,
});
