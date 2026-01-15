import wrapAnsi from "wrap-ansi";
import cliTruncate from "cli-truncate";
import { type Styles } from "./styles.js";

const cache: Record<string, string> = {};

/**
 * Wraps or truncates text based on the specified maximum width and wrap type.
 * Results are cached to improve performance.
 *
 * @param text - The text to wrap or truncate.
 * @param maxWidth - The maximum width allowed for the text.
 * @param wrapType - The type of wrapping logic (e.g., 'wrap', 'truncate').
 * @returns The wrapped or truncated text.
 */
export const wrapText = (
  text: string,
  maxWidth: number,
  wrapType: Styles["textWrap"],
): string => {
  const cacheKey = text + String(maxWidth) + String(wrapType);
  const cachedText = cache[cacheKey];

  if (cachedText) {
    return cachedText;
  }

  let wrappedText = text;

  if (wrapType === "wrap") {
    wrappedText = wrapAnsi(text, maxWidth, {
      trim: false,
      hard: true,
    });
  }

  if (wrapType?.startsWith("truncate")) {
    let position: "end" | "middle" | "start" = "end";

    if (wrapType === "truncate-middle") {
      position = "middle";
    }

    if (wrapType === "truncate-start") {
      position = "start";
    }

    wrappedText = cliTruncate(text, maxWidth, { position });
  }

  cache[cacheKey] = wrappedText;

  return wrappedText;
};
