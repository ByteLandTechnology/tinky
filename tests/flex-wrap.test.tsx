import { test, expect } from "bun:test";
import { Box, Text } from "../src/index.js";
import { renderToString } from "./helpers/render-to-string.js";

/**
 * Verifies that items do not wrap by default in a row (`flexWrap="nowrap"`),
 * causing overflow if space is insufficient.
 */
test("row - no wrap", () => {
  const output = renderToString(
    <Box width={2}>
      <Text>A</Text>
      <Text>BC</Text>
    </Box>,
  );

  expect(output).toBe("AB\n C");
});

/**
 * Verifies that items do not wrap in a column by default.
 */
test("column - no wrap", () => {
  const output = renderToString(
    <Box flexDirection="column" height={2}>
      <Text>A</Text>
      <Text>B</Text>
      <Text>C</Text>
    </Box>,
  );

  expect(output).toBe("A\nB");
});

/**
 * Verifies that `flexWrap="wrap"` allows items in a row to wrap to the next
 * line when space is insufficient.
 */
test("row - wrap content", () => {
  const output = renderToString(
    <Box width={2} flexWrap="wrap">
      <Text>A</Text>
      <Text>BC</Text>
    </Box>,
  );

  expect(output).toBe("A\nBC");
});

/**
 * Verifies that `flexWrap="wrap"` allows items in a column to wrap to the next
 * column when vertical space is insufficient.
 */
test("column - wrap content", () => {
  const output = renderToString(
    <Box flexDirection="column" height={2} flexWrap="wrap">
      <Text>A</Text>
      <Text>B</Text>
      <Text>C</Text>
    </Box>,
  );

  expect(output).toBe("AC\nB");
});

/**
 * Verifies that `flexWrap="wrap-reverse"` wraps items in a column to the
 * previous column.
 */
test("column - wrap content reverse", () => {
  const output = renderToString(
    <Box flexDirection="column" height={2} width={3} flexWrap="wrap-reverse">
      <Text>A</Text>
      <Text>B</Text>
      <Text>C</Text>
    </Box>,
  );

  expect(output).toBe(" CA\n  B");
});

/**
 * Verifies that `flexWrap="wrap-reverse"` wraps items in a row to the
 * *previous* line (stacking lines bottom-to-top).
 */
test("row - wrap content reverse", () => {
  const output = renderToString(
    <Box height={3} width={2} flexWrap="wrap-reverse">
      <Text>A</Text>
      <Text>B</Text>
      <Text>C</Text>
    </Box>,
  );

  expect(output).toBe("\nC\nAB");
});
