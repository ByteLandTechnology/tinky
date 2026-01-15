import { test, expect } from "bun:test";
import { Box, Text } from "../src/index.js";
import { renderToString } from "./helpers/render-to-string.js";

/**
 * Verifies that `margin` adds space on all sides of the box.
 */
test("margin", () => {
  const output = renderToString(
    <Box margin={2}>
      <Text>X</Text>
    </Box>,
  );

  expect(output).toBe("\n\n  X\n\n");
});

/**
 * Verifies that `marginX` adds horizontal space (left and right) around the box.
 */
test("margin X", () => {
  const output = renderToString(
    <Box>
      <Box marginX={2}>
        <Text>X</Text>
      </Box>
      <Text>Y</Text>
    </Box>,
  );

  expect(output).toBe("  X  Y");
});

/**
 * Verifies that `marginY` adds vertical space (top and bottom) around the box.
 */
test("margin Y", () => {
  const output = renderToString(
    <Box marginY={2}>
      <Text>X</Text>
    </Box>,
  );

  expect(output).toBe("\n\nX\n\n");
});

/**
 * Verifies that `marginTop` adds space above the box.
 */
test("margin top", () => {
  const output = renderToString(
    <Box marginTop={2}>
      <Text>X</Text>
    </Box>,
  );

  expect(output).toBe("\n\nX");
});

/**
 * Verifies that `marginBottom` adds space below the box.
 */
test("margin bottom", () => {
  const output = renderToString(
    <Box marginBottom={2}>
      <Text>X</Text>
    </Box>,
  );

  expect(output).toBe("X\n\n");
});

/**
 * Verifies that `marginLeft` adds space to the left of the box.
 */
test("margin left", () => {
  const output = renderToString(
    <Box marginLeft={2}>
      <Text>X</Text>
    </Box>,
  );

  expect(output).toBe("  X");
});

/**
 * Verifies that `marginRight` adds space to the right of the box.
 */
test("margin right", () => {
  const output = renderToString(
    <Box>
      <Box marginRight={2}>
        <Text>X</Text>
      </Box>
      <Text>Y</Text>
    </Box>,
  );

  expect(output).toBe("X  Y");
});

/**
 * Verifies that nested margins accumulate correctly.
 */
test("nested margin", () => {
  const output = renderToString(
    <Box margin={2}>
      <Box margin={2}>
        <Text>X</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("\n\n\n\n    X\n\n\n\n");
});

/**
 * Verifies that margin works correctly with multi-line text content.
 */
test("margin with multiline string", () => {
  const output = renderToString(
    <Box margin={2}>
      <Text>{"A\nB"}</Text>
    </Box>,
  );

  expect(output).toBe("\n\n  A\n  B\n\n");
});

/**
 * Verifies that margin is applied correctly when text contains newline
 * characters interlaced in JSX.
 */
test("apply margin to text with newlines", () => {
  const output = renderToString(
    <Box margin={1}>
      <Text>Hello{"\n"}World</Text>
    </Box>,
  );
  expect(output).toBe("\n Hello\n World\n");
});

/**
 * Verifies that margin is applied correctly when text wraps due to width
 * constraints.
 */
test("apply margin to wrapped text", () => {
  const output = renderToString(
    <Box margin={1} width={6}>
      <Text>Hello World</Text>
    </Box>,
  );

  expect(output).toBe("\n Hello\n World\n");
});
