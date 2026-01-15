import { useContext } from "react";
import { type FocusProps, FocusContext } from "../components/FocusContext.js";

/**
 * Output of the useFocusManager hook.
 */
interface Output {
  /**
   * Enable focus management for all components.
   */
  enableFocus: FocusProps["enableFocus"];

  /**
   * Disable focus management for all components. The currently active
   * component (if there's one) will lose its focus.
   */
  disableFocus: FocusProps["disableFocus"];

  /**
   * Switch focus to the next focusable component. If there's no active
   * component, focus is given to the first. If active is last, focus wraps.
   */
  focusNext: FocusProps["focusNext"];

  /**
   * Switch focus to the previous focusable component. If there's no active
   * component right now, focus will be given to the first focusable component.
   * If the active component is the first in the list of focusable components,
   * focus will be switched to the last focusable component.
   */
  focusPrevious: FocusProps["focusPrevious"];

  /**
   * Switch focus to the element with provided `id`. If there's no element with
   * that `id`, focus will be given to the first focusable component.
   */
  focus: FocusProps["focus"];
}

/**
 * This hook exposes methods to enable or disable focus management for all
 * components or manually switch focus to the next or previous components.
 *
 * @returns Object containing focus management functions.
 */
export const useFocusManager = (): Output => {
  const focusContext = useContext(FocusContext);

  return {
    enableFocus: focusContext.enableFocus,
    disableFocus: focusContext.disableFocus,
    focusNext: focusContext.focusNext,
    focusPrevious: focusContext.focusPrevious,
    focus: focusContext.focus,
  };
};
