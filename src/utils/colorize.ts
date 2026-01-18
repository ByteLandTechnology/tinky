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
export const colorize = (
  str: string,
  color: string | undefined,
  type: ColorType,
): string => {
  if (!color) {
    return str;
  }

  if (isNamedColor(color)) {
    if (type === "foreground") {
      return ansis[color](str);
    }

    const methodName = `bg${
      color.charAt(0).toUpperCase() + color.slice(1)
    }` as BackgroundColorName;

    return ansis[methodName](str);
  }

  if (color.startsWith("#")) {
    return type === "foreground"
      ? ansis.hex(color)(str)
      : ansis.bgHex(color)(str);
  }

  if (color.startsWith("ansi256")) {
    const matches = ansiRegex.exec(color);

    if (!matches) {
      return str;
    }

    const value = Number(matches[1]);

    return type === "foreground" ? ansis.fg(value)(str) : ansis.bg(value)(str);
  }

  if (color.startsWith("rgb")) {
    const matches = rgbRegex.exec(color);

    if (!matches) {
      return str;
    }

    const firstValue = Number(matches[1]);
    const secondValue = Number(matches[2]);
    const thirdValue = Number(matches[3]);

    return type === "foreground"
      ? ansis.rgb(firstValue, secondValue, thirdValue)(str)
      : ansis.bgRgb(firstValue, secondValue, thirdValue)(str);
  }

  return str;
};
