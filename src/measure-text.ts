import widestLine from "widest-line";

const cache = new Map<string, Output>();

interface Output {
  width: number;
  height: number;
}

/**
 * Measures the width and height of a text string.
 * Results are cached to improve performance.
 *
 * @param text - The text string to measure.
 * @returns The width and height of the text.
 */
export const measureText = (text: string): Output => {
  if (text.length === 0) {
    return {
      width: 0,
      height: 0,
    };
  }

  const cachedDimensions = cache.get(text);

  if (cachedDimensions) {
    return cachedDimensions;
  }

  const width = widestLine(text);
  const height = text.split("\n").length;
  const dimensions = { width, height };
  cache.set(text, dimensions);

  return dimensions;
};
