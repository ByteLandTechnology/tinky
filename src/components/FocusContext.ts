import { createContext } from "react";

/**
 * Props for the FocusContext.
 */
export interface FocusProps {
  /**
   * The ID of the currently active (focused) component.
   */
  readonly activeId?: string;

  /**
   * Register a new focusable component.
   */
  readonly add: (id: string, options: { autoFocus: boolean }) => void;

  /**
   * Unregister a focusable component.
   */
  readonly remove: (id: string) => void;

  /**
   * Mark a component as active.
   */
  readonly activate: (id: string) => void;

  /**
   * Mark a component as inactive.
   */
  readonly deactivate: (id: string) => void;

  /**
   * Enable focus management.
   */
  readonly enableFocus: () => void;

  /**
   * Disable focus management.
   */
  readonly disableFocus: () => void;

  /**
   * Move focus to the next component.
   */
  readonly focusNext: () => void;

  /**
   * Move focus to the previous component.
   */
  readonly focusPrevious: () => void;

  /**
   * Focus a specific component by ID.
   */
  readonly focus: (id: string) => void;
}

/**
 * Context to manage focus state across the application.
 */
export const FocusContext = createContext<FocusProps>({
  activeId: undefined,
  add() {
    // no-op
  },
  remove() {
    // no-op
  },
  activate() {
    // no-op
  },
  deactivate() {
    // no-op
  },
  enableFocus() {
    // no-op
  },
  disableFocus() {
    // no-op
  },
  focusNext() {
    // no-op
  },
  focusPrevious() {
    // no-op
  },
  focus() {
    // no-op
  },
});

FocusContext.displayName = "InternalFocusContext";
