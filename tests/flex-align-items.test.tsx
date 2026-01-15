import { test, expect } from "bun:test";
import { Box, Text } from "../src/index.js";
import { renderToString } from "./helpers/render-to-string.js";

/**
 * Verifies that items in a row can be vertically aligned to the center using
 * `alignItems="center"`.
 */
test("row - align text to center", () => {
  const output = renderToString(
    <Box alignItems="center" height={3}>
      <Text>Test</Text>
    </Box>,
  );

  expect(output).toBe("\nTest\n");
});

/**
 * Verifies that multiple items in a row are all vertically aligned to the center.
 */
test("row - align multiple text nodes to center", () => {
  const output = renderToString(
    <Box alignItems="center" height={3}>
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("\nAB\n");
});

/**
 * Verifies that items in a row can be vertically aligned to the bottom using
 * `alignItems="flex-end"`.
 */
test("row - align text to bottom", () => {
  const output = renderToString(
    <Box alignItems="flex-end" height={3}>
      <Text>Test</Text>
    </Box>,
  );

  expect(output).toBe("\n\nTest");
});

/**
 * Verifies that multiple items in a row are all vertically aligned to the bottom.
 */
test("row - align multiple text nodes to bottom", () => {
  const output = renderToString(
    <Box alignItems="flex-end" height={3}>
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("\n\nAB");
});

/**
 * Verifies that items in a column can be horizontally aligned to the center
 * using `alignItems="center"`.
 */
test("column - align text to center", () => {
  const output = renderToString(
    <Box flexDirection="column" alignItems="center" width={10}>
      <Text>Test</Text>
    </Box>,
  );

  expect(output).toBe("   Test");
});

/**
 * Verifies that items in a column can be horizontally aligned to the right
 * using `alignItems="flex-end"`.
 */
test("column - align text to right", () => {
  const output = renderToString(
    <Box flexDirection="column" alignItems="flex-end" width={10}>
      <Text>Test</Text>
    </Box>,
  );

  expect(output).toBe("      Test");
});
