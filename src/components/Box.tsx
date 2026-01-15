import { forwardRef, useContext, type PropsWithChildren } from "react";
import { type Except } from "type-fest";
import { type Styles } from "../styles.js";
import { type DOMElement } from "../dom.js";
import { AccessibilityContext } from "./AccessibilityContext.js";
import { backgroundContext } from "./BackgroundContext.js";

/**
 * Props for the Box component.
 */
export type BoxProps = Except<Styles, "textWrap"> & {
  /**
   * A label for the element for screen readers.
   */
  readonly "aria-label"?: string;

  /**
   * Hide the element from screen readers.
   */
  readonly "aria-hidden"?: boolean;

  /**
   * The role of the element.
   */
  readonly "aria-role"?:
    | "button"
    | "checkbox"
    | "combobox"
    | "list"
    | "listbox"
    | "listitem"
    | "menu"
    | "menuitem"
    | "option"
    | "progressbar"
    | "radio"
    | "radiogroup"
    | "tab"
    | "tablist"
    | "table"
    | "textbox"
    | "timer"
    | "toolbar";

  /**
   * The state of the element.
   */
  readonly "aria-state"?: {
    readonly busy?: boolean;
    readonly checked?: boolean;
    readonly disabled?: boolean;
    readonly expanded?: boolean;
    readonly multiline?: boolean;
    readonly multiselectable?: boolean;
    readonly readonly?: boolean;
    readonly required?: boolean;
    readonly selected?: boolean;
  };
};

/**
 * `<Box>` is an essential Tinky component to build your layout. It's like
 * `<div style="display: flex">` in the browser.
 *
 * @example
 * ```tsx
 * import {render, Box, Text} from 'tinky';
 *
 * render(
 *   <Box margin={2}>
 *     <Text>This is a box with margin</Text>
 *   </Box>
 * );
 * ```
 *
 * @example
 * ```tsx
 * import {render, Box, Text} from 'tinky';
 *
 * render(
 *   <Box flexDirection="column">
 *     <Text>Item 1</Text>
 *     <Text>Item 2</Text>
 *   </Box>
 * );
 * ```
 */
export const Box = forwardRef<DOMElement, PropsWithChildren<BoxProps>>(
  (
    {
      children,
      backgroundColor,
      "aria-label": ariaLabel,
      "aria-hidden": ariaHidden,
      "aria-role": role,
      "aria-state": ariaState,
      ...style
    },
    ref,
  ) => {
    const { isScreenReaderEnabled } = useContext(AccessibilityContext);
    const label = ariaLabel ? <tinky-text>{ariaLabel}</tinky-text> : undefined;
    if (isScreenReaderEnabled && ariaHidden) {
      return null;
    }

    const boxElement = (
      <tinky-box
        ref={ref}
        style={{
          flexWrap: "nowrap",
          flexDirection: "row",
          flexGrow: 0,
          flexShrink: 1,
          ...style,
          backgroundColor,
          overflowX: style.overflowX ?? style.overflow ?? "visible",
          overflowY: style.overflowY ?? style.overflow ?? "visible",
        }}
        internal_accessibility={{
          role,
          state: ariaState,
        }}
      >
        {isScreenReaderEnabled && label ? label : children}
      </tinky-box>
    );

    // If this Box has a background color, provide it to children via context
    if (backgroundColor) {
      return (
        <backgroundContext.Provider value={backgroundColor}>
          {boxElement}
        </backgroundContext.Provider>
      );
    }

    return boxElement;
  },
);

Box.displayName = "Box";
