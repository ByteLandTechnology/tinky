import chalk, { type ForegroundColorName } from "chalk";
import { type LiteralUnion } from "type-fest";
import { colorize } from "./colorize.js";

/**
 * Common text styling props used by components like Text and Separator.
 */
export interface TextStyles {
  /**
   * Change text color. Tinky uses Chalk under the hood, so all its functionality
   * is supported.
   */
  readonly color?: LiteralUnion<ForegroundColorName, string>;

  /**
   * Same as `color`, but for the background.
   */
  readonly backgroundColor?: LiteralUnion<ForegroundColorName, string>;

  /**
   * Dim the color (make it less bright).
   */
  readonly dimColor?: boolean;

  /**
   * Make the text bold.
   */
  readonly bold?: boolean;

  /**
   * Make the text italic.
   */
  readonly italic?: boolean;

  /**
   * Make the text underlined.
   */
  readonly underline?: boolean;

  /**
   * Make the text crossed out with a line.
   */
  readonly strikethrough?: boolean;

  /**
   * Inverse background and foreground colors.
   */
  readonly inverse?: boolean;
}

/**
 * Applies text styles (color, bold, etc.) to a string using Chalk.
 *
 * @param text - The text to apply styles to.
 * @param styles - The styles to apply.
 * @returns The styled text.
 */
export const applyTextStyles = (text: string, styles: TextStyles): string => {
  if (styles.dimColor) {
    text = chalk.dim(text);
  }

  if (styles.color) {
    text = colorize(text, styles.color, "foreground");
  }

  if (styles.backgroundColor) {
    text = colorize(text, styles.backgroundColor, "background");
  }

  if (styles.bold) {
    text = chalk.bold(text);
  }

  if (styles.italic) {
    text = chalk.italic(text);
  }

  if (styles.underline) {
    text = chalk.underline(text);
  }

  if (styles.strikethrough) {
    text = chalk.strikethrough(text);
  }

  if (styles.inverse) {
    text = chalk.inverse(text);
  }

  return text;
};
