import { test, expect } from "bun:test";
import { Box, Text } from "../src/index.js";
import { renderToString } from "./helpers/render-to-string.js";

/**
 * Verifies that `gap` adds space between items in a row with flex wrap.
 */
test("gap", () => {
  const output = renderToString(
    <Box gap={1} width={3} flexWrap="wrap">
      <Text>A</Text>
      <Text>B</Text>
      <Text>C</Text>
    </Box>,
  );

  expect(output).toBe("A B\n\nC");
});

/**
 * Verifies that `gap` adds space between items in a row.
 */
test("column gap", () => {
  const output = renderToString(
    <Box gap={1}>
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("A B");
});

/**
 * Verifies that `gap` adds vertical space between items in a column layout
 * (despite the test name "row gap", it uses `flexDirection="column"`).
 * The name might refer to the CSS `row-gap` property equivalent.
 */
test("row gap", () => {
  const output = renderToString(
    <Box flexDirection="column" gap={1}>
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("A\n\nB");
});
