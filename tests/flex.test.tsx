import { test, expect } from "bun:test";
import { Box, Text } from "../src/index.js";
import { renderToString } from "./helpers/render-to-string.js";

/**
 * Verifies that items with `flexGrow` distribute available space equally among
 * themselves.
 */
test("grow equally", () => {
  const output = renderToString(
    <Box width={6}>
      <Box flexGrow={1}>
        <Text>A</Text>
      </Box>
      <Box flexGrow={1}>
        <Text>B</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("A  B");
});

/**
 * Verifies that a single item with `flexGrow` takes up all remaining available
 * space.
 */
test("grow one element", () => {
  const output = renderToString(
    <Box width={6}>
      <Box flexGrow={1}>
        <Text>A</Text>
      </Box>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("A    B");
});

/**
 * Verifies that items with `flexShrink={0}` do not shrink even if they exceed
 * the container width, preserving their defined dimensions.
 */
test("dont shrink", () => {
  const output = renderToString(
    <Box width={16}>
      <Box flexShrink={0} width={6}>
        <Text>A</Text>
      </Box>
      <Box flexShrink={0} width={6}>
        <Text>B</Text>
      </Box>
      <Box width={6}>
        <Text>C</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("A     B     C");
});

/**
 * Verifies that items with `flexShrink={1}` shrink equally when space is
 * insufficient.
 */
test("shrink equally", () => {
  const output = renderToString(
    <Box width={10}>
      <Box flexShrink={1} width={6}>
        <Text>A</Text>
      </Box>
      <Box flexShrink={1} width={6}>
        <Text>B</Text>
      </Box>
      <Text>C</Text>
    </Box>,
  );

  expect(output).toBe("A    B   C");
});

/**
 * Verifies that `flexBasis` sets the initial size of an item in a row before
 * growing/shrinking.
 */
test('set flex basis with flexDirection="row" container', () => {
  const output = renderToString(
    <Box width={6}>
      <Box flexBasis={3}>
        <Text>A</Text>
      </Box>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("A  B");
});

/**
 * Verifies that `flexBasis` works with percentage values in a row.
 */
test('set flex basis in percent with flexDirection="row" container', () => {
  const output = renderToString(
    <Box width={6}>
      <Box flexBasis="50%">
        <Text>A</Text>
      </Box>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("A  B");
});

/**
 * Verifies that `flexBasis` sets the initial height of an item in a column
 * layout.
 */
test('set flex basis with flexDirection="column" container', () => {
  const output = renderToString(
    <Box height={6} flexDirection="column">
      <Box flexBasis={3}>
        <Text>A</Text>
      </Box>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("A\n\n\nB\n\n");
});

/**
 * Verifies that `flexBasis` works with percentage values in a column layout.
 */
test('set flex basis in percent with flexDirection="column" container', () => {
  const output = renderToString(
    <Box height={6} flexDirection="column">
      <Box flexBasis="50%">
        <Text>A</Text>
      </Box>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("A\n\n\nB\n\n");
});
