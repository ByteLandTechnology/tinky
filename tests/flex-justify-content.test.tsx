import { test, expect } from "bun:test";
import chalk from "chalk";
import { Box, Text } from "../src/index.js";
import { renderToString } from "./helpers/render-to-string.js";

/**
 * Verifies that items in a row can be aligned to the center horizontally using
 * `justifyContent="center"`.
 */
test("row - align text to center", () => {
  const output = renderToString(
    <Box justifyContent="center" width={10}>
      <Text>Test</Text>
    </Box>,
  );

  expect(output).toBe("   Test");
});

/**
 * Verifies that multiple items in a row are all aligned to the center
 * horizontally.
 */
test("row - align multiple text nodes to center", () => {
  const output = renderToString(
    <Box justifyContent="center" width={10}>
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("    AB");
});

/**
 * Verifies that items in a row can be aligned to the right using
 * `justifyContent="flex-end"`.
 * */
test("row - align text to right", () => {
  const output = renderToString(
    <Box justifyContent="flex-end" width={10}>
      <Text>Test</Text>
    </Box>,
  );

  expect(output).toBe("      Test");
});

/**
 * Verifies that multiple items in a row are aligned to the right using
 * `justifyContent="flex-end"`.
 */
test("row - align multiple text nodes to right", () => {
  const output = renderToString(
    <Box justifyContent="flex-end" width={10}>
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("        AB");
});

/**
 * Verifies that items are spaced apart with `justifyContent="space-between"`,
 * pushing the first and last items to the edges.
 */
test("row - align two text nodes on the edges", () => {
  const output = renderToString(
    <Box justifyContent="space-between" width={4}>
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("A  B");
});

/**
 * Verifies that items are spaced evenly with `justifyContent="space-evenly"`,
 * distributing equal space between and around items.
 */
test("row - space evenly two text nodes", () => {
  const output = renderToString(
    <Box justifyContent="space-evenly" width={10}>
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("   A  B");
});

/**
 * Verifies that items are spaced with `justifyContent="space-around"`,
 * providing equal space around each item (leading to double space between items).
 * Note: Yoga (layout engine) might have specific behaviors/bugs that this test
 * accounts for.
 */
test("row - align two text nodes with equal space around them", () => {
  const output = renderToString(
    <Box justifyContent="space-around" width={5}>
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe(" A B");
});

/**
 * Verifies that styling (colors) is preserved when items are aligned with
 * `justifyContent`.
 */
test("row - align colored text node when text is squashed", () => {
  const output = renderToString(
    <Box justifyContent="flex-end" width={5}>
      <Text color="green">X</Text>
    </Box>,
  );

  expect(output).toBe(`    ${chalk.green("X")}`);
});

/**
 * Verifies that items in a column can be aligned to the center vertically using
 * `justifyContent="center"`.
 */
test("column - align text to center", () => {
  const output = renderToString(
    <Box flexDirection="column" justifyContent="center" height={3}>
      <Text>Test</Text>
    </Box>,
  );

  expect(output).toBe("\nTest\n");
});

/**
 * Verifies that items in a column can be aligned to the bottom (end) using
 * `justifyContent="flex-end"`.
 */
test("column - align text to bottom", () => {
  const output = renderToString(
    <Box flexDirection="column" justifyContent="flex-end" height={3}>
      <Text>Test</Text>
    </Box>,
  );

  expect(output).toBe("\n\nTest");
});

/**
 * Verifies that items in a column are spaced apart with
 * `justifyContent="space-between"`, pushing items to the top and bottom edges.
 */
test("column - align two text nodes on the edges", () => {
  const output = renderToString(
    <Box flexDirection="column" justifyContent="space-between" height={4}>
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("A\n\n\nB");
});

/**
 * Verifies that items in a column are spaced with
 * `justifyContent="space-around"`, providing equal space above and below each
 * item.
 */
test("column - align two text nodes with equal space around them", () => {
  const output = renderToString(
    <Box flexDirection="column" justifyContent="space-around" height={5}>
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("\nA\n\nB\n");
});
