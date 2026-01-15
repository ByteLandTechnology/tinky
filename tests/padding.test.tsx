import { test, expect } from "bun:test";
import { Box, Text } from "../src/index.js";
import { renderToString } from "./helpers/render-to-string.js";

/**
 * Verifies that `padding` adds space inside the box on all sides.
 */
test("padding", () => {
  const output = renderToString(
    <Box padding={2}>
      <Text>X</Text>
    </Box>,
  );

  expect(output).toBe("\n\n  X\n\n");
});

/**
 * Verifies that `paddingX` adds horizontal space (left and right) inside the box.
 */
test("padding X", () => {
  const output = renderToString(
    <Box>
      <Box paddingX={2}>
        <Text>X</Text>
      </Box>
      <Text>Y</Text>
    </Box>,
  );

  expect(output).toBe("  X  Y");
});

/**
 * Verifies that `paddingY` adds vertical space (top and bottom) inside the box.
 */
test("padding Y", () => {
  const output = renderToString(
    <Box paddingY={2}>
      <Text>X</Text>
    </Box>,
  );

  expect(output).toBe("\n\nX\n\n");
});

/**
 * Verifies that `paddingTop` adds space inside the box at the top.
 */
test("padding top", () => {
  const output = renderToString(
    <Box paddingTop={2}>
      <Text>X</Text>
    </Box>,
  );

  expect(output).toBe("\n\nX");
});

/**
 * Verifies that `paddingBottom` adds space inside the box at the bottom.
 */
test("padding bottom", () => {
  const output = renderToString(
    <Box paddingBottom={2}>
      <Text>X</Text>
    </Box>,
  );

  expect(output).toBe("X\n\n");
});

/**
 * Verifies that `paddingLeft` adds space inside the box at the left.
 */
test("padding left", () => {
  const output = renderToString(
    <Box paddingLeft={2}>
      <Text>X</Text>
    </Box>,
  );

  expect(output).toBe("  X");
});

/**
 * Verifies that `paddingRight` adds space inside the box at the right.
 */
test("padding right", () => {
  const output = renderToString(
    <Box>
      <Box paddingRight={2}>
        <Text>X</Text>
      </Box>
      <Text>Y</Text>
    </Box>,
  );

  expect(output).toBe("X  Y");
});

/**
 * Verifies that nested padding accumulates correctly.
 */
test("nested padding", () => {
  const output = renderToString(
    <Box padding={2}>
      <Box padding={2}>
        <Text>X</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("\n\n\n\n    X\n\n\n\n");
});

/**
 * Verifies that padding works correctly with multi-line text content.
 */
test("padding with multiline string", () => {
  const output = renderToString(
    <Box padding={2}>
      <Text>{"A\nB"}</Text>
    </Box>,
  );

  expect(output).toBe("\n\n  A\n  B\n\n");
});

/**
 * Verifies that padding is applied correctly when text contains newline
 * characters interlaced in JSX.
 */
test("apply padding to text with newlines", () => {
  const output = renderToString(
    <Box padding={1}>
      <Text>Hello{"\n"}World</Text>
    </Box>,
  );
  expect(output).toBe("\n Hello\n World\n");
});

/**
 * Verifies that padding is applied correctly when text wraps due to width
 * constraints.
 */
test("apply padding to wrapped text", () => {
  const output = renderToString(
    <Box padding={1} width={5}>
      <Text>Hello World</Text>
    </Box>,
  );

  expect(output).toBe("\n Hel\n lo\n Wor\n ld\n");
});
