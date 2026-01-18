import {
  applyTextStyles,
  type TextStyles,
} from "../utils/apply-text-styles.js";

/**
 * Props for the Separator component.
 */
export interface SeparatorProps extends TextStyles {
  /**
   * The character to repeat for the separator line.
   *
   * @defaultValue "─"
   * @example
   * ```tsx
   * <Separator char="=" />
   * ```
   */
  readonly char?: string;

  /**
   * The direction of the separator.
   *
   * - `"horizontal"`: The separator will expand horizontally to fill the container's width. Height will be 1 row.
   * - `"vertical"`: The separator will expand vertically to fill the container's height. Width will be 1 column.
   *
   * @defaultValue "horizontal"
   */
  readonly direction?: "horizontal" | "vertical";
}

/**
 * A component that renders a line of repeated characters to fill the available space.
 *
 * The `<Separator>` component is designed to be efficient and layout-friendly.
 * Unlike manually repeating a character in a generic text string, this component
 * uses the underlying layout engine (Taffy) to determine the exact number of
 * characters needed to fill the container. This prevents overflow issues and
 * avoids allocating unnecessarily large strings in memory.
 *
 * It supports both horizontal and vertical orientations and accepts all standard
 * text styling properties (color, background, bold, etc.).
 *
 * @example
 * **Basic Usage**
 *
 * Renders a horizontal line using the default character "─".
 *
 * ```tsx
 * import { render, Box, Separator } from 'tinky';
 *
 * render(
 *   <Box flexDirection="column" width={20}>
 *     <Text>Title</Text>
 *     <Separator />
 *     <Text>Content</Text>
 *   </Box>
 * );
 * ```
 *
 * @example
 * **Vertical Separator**
 *
 * Renders a vertical line in a row layout.
 *
 * ```tsx
 * <Box height={5}>
 *   <Text>Left</Text>
 *   <Separator direction="vertical" char="│" />
 *   <Text>Right</Text>
 * </Box>
 * ```
 *
 * @example
 * **Styling**
 *
 * You can apply colors and text modifiers just like with the `<Text>` component.
 *
 * ```tsx
 * <Separator
 *   char="="
 *   color="blue"
 *   bold
 *   backgroundColor="white"
 * />
 * ```
 */
export function Separator({
  char = "─",
  direction = "horizontal",
  color,
  dimColor = false,
  backgroundColor,
  bold = false,
  italic = false,
  underline = false,
  strikethrough = false,
  inverse = false,
}: SeparatorProps) {
  const style =
    direction === "horizontal"
      ? { flexGrow: 1, flexShrink: 0, height: 1 }
      : { flexGrow: 1, flexShrink: 0, width: 1 };

  return (
    <tinky-separator
      style={style}
      internal_separatorChar={char}
      internal_separatorDirection={direction}
      internal_transform={(text: string) => {
        return applyTextStyles(text, {
          dimColor,
          color,
          backgroundColor,
          bold,
          italic,
          underline,
          strikethrough,
          inverse,
        });
      }}
    />
  );
}
