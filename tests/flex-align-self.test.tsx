import { test, expect } from "bun:test";
import { Box, Text } from "../src/index.js";
import { renderToString } from "./helpers/render-to-string.js";

/**
 * Verifies that a specific item in a row can override the container's alignment
 * logic using `alignSelf="center"`.
 */
test("row - align text to center", () => {
  const output = renderToString(
    <Box height={3}>
      <Box alignSelf="center">
        <Text>Test</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("\nTest\n");
});

/**
 * Verifies that a container with `alignSelf="center"` correctly centers its
 * children (if they flow normally) within the parent's cross axis.
 */
test("row - align multiple text nodes to center", () => {
  const output = renderToString(
    <Box height={3}>
      <Box alignSelf="center">
        <Text>A</Text>
        <Text>B</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("\nAB\n");
});

/**
 * Verifies that a specific item in a row can align itself to the bottom using
 * `alignSelf="flex-end"`.
 */
test("row - align text to bottom", () => {
  const output = renderToString(
    <Box height={3}>
      <Box alignSelf="flex-end">
        <Text>Test</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("\n\nTest");
});

/**
 * Verifies that a container with `alignSelf="flex-end"` correctly aligns nicely
 * to the bottom.
 */
test("row - align multiple text nodes to bottom", () => {
  const output = renderToString(
    <Box height={3}>
      <Box alignSelf="flex-end">
        <Text>A</Text>
        <Text>B</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("\n\nAB");
});

/**
 * Verifies that a specific item in a column can align itself to the center
 * horizontally using `alignSelf="center"`.
 */
test("column - align text to center", () => {
  const output = renderToString(
    <Box flexDirection="column" width={10}>
      <Box alignSelf="center">
        <Text>Test</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("   Test");
});

/**
 * Verifies that a specific item in a column can align itself to the right using
 * `alignSelf="flex-end"`.
 */
test("column - align text to right", () => {
  const output = renderToString(
    <Box flexDirection="column" width={10}>
      <Box alignSelf="flex-end">
        <Text>Test</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("      Test");
});
