import { useContext, type ReactNode } from "react";
import { AccessibilityContext } from "./AccessibilityContext.js";

/**
 * Props for the Transform component.
 */
export interface TransformProps {
  /**
   * Screen-reader-specific text to output. If set, all children will be
   * ignored.
   */
  readonly accessibilityLabel?: string;

  /**
   * Function that transforms children output. It accepts children and must
   * return transformed children as well.
   */
  readonly transform: (children: string, index: number) => string;

  /**
   * Children to transform.
   */
  readonly children?: ReactNode;
}

/**
 * Transform a string representation of React components before they're written
 * to output. For example, you might want to apply a gradient to text, add a
 * clickable link, or create some text effects. These use cases can't accept
 * React nodes as input; they expect a string. That's what the <Transform>
 * component does: it gives you an output string of its child components and
 * lets you transform it in any way.
 *
 * @example
 * ```tsx
 * import {render, Transform, Text} from 'tinky';
 *
 * render(
 *   <Transform transform={output => output.toUpperCase()}>
 *     <Text>Hello World</Text>
 *   </Transform>
 * );
 * // Output: HELLO WORLD
 * ```
 */
export function Transform({
  children,
  transform,
  accessibilityLabel,
}: TransformProps) {
  const { isScreenReaderEnabled } = useContext(AccessibilityContext);

  if (children === undefined || children === null) {
    return null;
  }

  return (
    <tinky-text
      style={{ flexGrow: 0, flexShrink: 1, flexDirection: "row" }}
      internal_transform={transform}
    >
      {isScreenReaderEnabled && accessibilityLabel
        ? accessibilityLabel
        : children}
    </tinky-text>
  );
}
