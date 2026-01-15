import { test, expect } from "bun:test";
import { Box, Text } from "../src/index.js";
import { renderToString } from "./helpers/render-to-string.js";

/**
 * Verifies that `flexDirection="row"` (default) renders children horizontally.
 */
test("direction row", () => {
  const output = renderToString(
    <Box flexDirection="row">
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("AB");
});

/**
 * Verifies that `flexDirection="row-reverse"` renders children horizontally in
 * reverse order.
 */
test("direction row reverse", () => {
  const output = renderToString(
    <Box flexDirection="row-reverse" width={4}>
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("  BA");
});

/**
 * Verifies that `flexDirection="column"` renders children vertically.
 */
test("direction column", () => {
  const output = renderToString(
    <Box flexDirection="column">
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("A\nB");
});

/**
 * Verifies that `flexDirection="column-reverse"` renders children vertically in
 * reverse order (bottom to top).
 */
test("direction column reverse", () => {
  const output = renderToString(
    <Box flexDirection="column-reverse" height={4}>
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("\n\nB\nA");
});

/**
 * Verifies that text nodes stacked via column direction are preserved as
 * distinct lines.
 */
test("don’t squash text nodes when column direction is applied", () => {
  const output = renderToString(
    <Box flexDirection="column">
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("A\nB");
});
