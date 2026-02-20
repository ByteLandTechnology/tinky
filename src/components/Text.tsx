import { useContext, useCallback, type ReactNode } from "react";
import {
  applyTextStyles,
  type TextStyles,
} from "../utils/apply-text-styles.js";
import { AccessibilityContext } from "../contexts/AccessibilityContext.js";
import { backgroundContext } from "../contexts/BackgroundContext.js";
import { type Styles } from "../core/styles.js";

/**
 * Props for the Text component.
 */
export interface TextProps extends TextStyles {
  /**
   * A label for the element for screen readers.
   */
  readonly "aria-label"?: string;

  /**
   * Hide the element from screen readers.
   */
  readonly "aria-hidden"?: boolean;

  /**
   * This property tells Tinky to wrap or truncate text if its width is larger
   * than the container. If `wrap` is passed (the default), Tinky will wrap text
   * and split it into multiple lines. If `truncate-*` is passed, Tinky will
   * truncate text instead, resulting in one line with the rest cut off.
   */
  readonly wrap?: Styles["textWrap"];

  /**
   * Children of the component.
   */
  readonly children?: ReactNode;
}

/**
 * This component can display text and change its style to make it bold,
 * underlined, italic, or strikethrough.
 *
 * @example
 * ```tsx
 * import {render, Text} from 'tinky';
 *
 * render(<Text color="green">I am green</Text>);
 * ```
 *
 * @example
 * ```tsx
 * import {render, Text} from 'tinky';
 *
 * render(
 *   <Text bold backgroundColor="blue">
 *     I am bold on blue background
 *   </Text>
 * );
 * ```
 */
export function Text({
  color,
  backgroundColor,
  dimColor = false,
  bold = false,
  italic = false,
  underline = false,
  strikethrough = false,
  inverse = false,
  wrap = "wrap",
  children,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden = false,
}: TextProps) {
  const { isScreenReaderEnabled } = useContext(AccessibilityContext);
  const inheritedBackgroundColor = useContext(backgroundContext);
  const childrenOrAriaLabel =
    isScreenReaderEnabled && ariaLabel ? ariaLabel : children;
  const effectiveBackgroundColor = backgroundColor ?? inheritedBackgroundColor;
  const hasTextStyle =
    color !== undefined ||
    effectiveBackgroundColor !== undefined ||
    dimColor ||
    bold ||
    italic ||
    underline ||
    strikethrough ||
    inverse;

  if (childrenOrAriaLabel === undefined || childrenOrAriaLabel === null) {
    return null;
  }

  const transform = useCallback(
    (children: string): string => {
      return applyTextStyles(children, {
        color,
        backgroundColor: effectiveBackgroundColor,
        dimColor,
        bold,
        italic,
        underline,
        strikethrough,
        inverse,
      });
    },
    [
      color,
      effectiveBackgroundColor,
      dimColor,
      bold,
      italic,
      underline,
      strikethrough,
      inverse,
    ],
  );

  if (isScreenReaderEnabled && ariaHidden) {
    return null;
  }

  return (
    <tinky-text
      style={{
        flexGrow: 0,
        flexShrink: 1,
        flexDirection: "row",
        textWrap: wrap,
      }}
      internal_transform={hasTextStyle ? transform : undefined}
    >
      {isScreenReaderEnabled && ariaLabel ? ariaLabel : children}
    </tinky-text>
  );
}
