import { test, expect } from "bun:test";
import { measureText } from "../src/measure-text.js";

/**
 * Verifies that `measureText` utility correctly calculates the width of a given
 * string. This checks specifically for "constructor" to ensure no property
 * collision issues.
 */
test('measure "constructor"', () => {
  const { width } = measureText("constructor");
  expect(width).toBe(11);
});
