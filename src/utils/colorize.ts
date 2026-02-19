import ansis from "ansis";

/**
 * Supported foreground color names.
 */
export type ForegroundColorName =
  | "black"
  | "blue"
  | "blueBright"
  | "cyan"
  | "cyanBright"
  | "gray"
  | "green"
  | "greenBright"
  | "magenta"
  | "magentaBright"
  | "red"
  | "redBright"
  | "white"
  | "whiteBright"
  | "yellow"
  | "yellowBright";

/**
 * Supported background color names.
 */
export type BackgroundColorName =
  | "bgBlack"
  | "bgBlue"
  | "bgBlueBright"
  | "bgCyan"
  | "bgCyanBright"
  | "bgGray"
  | "bgGreen"
  | "bgGreenBright"
  | "bgMagenta"
  | "bgMagentaBright"
  | "bgRed"
  | "bgRedBright"
  | "bgWhite"
  | "bgWhiteBright"
  | "bgYellow"
  | "bgYellowBright";

/**
 * Type representing the target of the color application (foreground or
 * background).
 */
type ColorType = "foreground" | "background";

const rgbRegex = /^rgb\(\s?(\d+),\s?(\d+),\s?(\d+)\s?\)$/;
const ansiRegex = /^ansi256\(\s?(\d+)\s?\)$/;

const isNamedColor = (color: string): color is ForegroundColorName => {
  return color in ansis;
};

/**
 * Applies a color to a string using Ansis.
 * Supports named colors, hex codes, RGB values, and ANSI-256 color codes.
 *
 * @param str - The string to colorize.
 * @param color - The color to apply.
 * @param type - Whether to apply the color to the foreground or background.
 * @returns The colorized string.
 */
import { type AnsiCode } from "../types/ansi.js";

/**
 * Gets the ANSI style for a color.
 */
export const getStyle = (
  color: string | undefined,
  type: ColorType,
): AnsiCode | undefined => {
  if (!color) {
    return undefined;
  }

  if (isNamedColor(color)) {
    if (type === "foreground") {
      return {
        type: "ansi",
        code: ansis[color].open,
        endCode: ansis[color].close,
      };
    }

    const methodName = `bg${
      color.charAt(0).toUpperCase() + color.slice(1)
    }` as BackgroundColorName;

    return {
      type: "ansi",
      code: ansis[methodName].open,
      endCode: ansis[methodName].close,
    };
  }

  if (color.startsWith("#")) {
    const style = type === "foreground" ? ansis.hex(color) : ansis.bgHex(color);
    return {
      type: "ansi",
      code: style.open,
      endCode: style.close,
    };
  }

  if (color.startsWith("ansi256")) {
    const matches = ansiRegex.exec(color);

    if (!matches) {
      return undefined;
    }

    const value = Number(matches[1]);
    const style = type === "foreground" ? ansis.fg(value) : ansis.bg(value);
    return {
      type: "ansi",
      code: style.open,
      endCode: style.close,
    };
  }

  if (color.startsWith("rgb")) {
    const matches = rgbRegex.exec(color);

    if (!matches) {
      return undefined;
    }

    const firstValue = Number(matches[1]);
    const secondValue = Number(matches[2]);
    const thirdValue = Number(matches[3]);

    const style =
      type === "foreground"
        ? ansis.rgb(firstValue, secondValue, thirdValue)
        : ansis.bgRgb(firstValue, secondValue, thirdValue);

    return {
      type: "ansi",
      code: style.open,
      endCode: style.close,
    };
  }

  return undefined;
};

export const colorize = (
  str: string,
  color: string | undefined,
  type: ColorType,
): string => {
  const style = getStyle(color, type);

  if (style) {
    return style.code + str + style.endCode;
  }

  return str;
};
