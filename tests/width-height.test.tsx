import { test, expect } from "bun:test";
import { Box, Text } from "../src/index.js";
import { renderToString } from "./helpers/render-to-string.js";

/**
 * Verifies that `width` sets a fixed width on the box.
 */
test("set width", () => {
  const output = renderToString(
    <Box>
      <Box width={5}>
        <Text>A</Text>
      </Box>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("A    B");
});

/**
 * Verifies that `width` accepts percentage values, calculating width relative
 * to the parent.
 */
test("set width in percent", () => {
  const output = renderToString(
    <Box width={10}>
      <Box width="50%">
        <Text>A</Text>
      </Box>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("A    B");
});

/**
 * Verifies that `minWidth` ensures the box is at least a certain width, but
 * allows it to grow if content requires more space.
 */
test("set min width", () => {
  const smallerOutput = renderToString(
    <Box>
      <Box minWidth={5}>
        <Text>A</Text>
      </Box>
      <Text>B</Text>
    </Box>,
  );

  expect(smallerOutput).toBe("A    B");

  const largerOutput = renderToString(
    <Box>
      <Box minWidth={2}>
        <Text>AAAAA</Text>
      </Box>
      <Text>B</Text>
    </Box>,
  );

  expect(largerOutput).toBe("AAAAAB");
});

/**
 * Verifies that `minWidth` works with percentage values.
 */
test("set min width in percent", () => {
  const output = renderToString(
    <Box width={10}>
      <Box minWidth="50%">
        <Text>A</Text>
      </Box>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("A    B");
});

/**
 * Verifies that `height` sets a fixed height on the box, extending it
 * vertically.
 */
test("set height", () => {
  const output = renderToString(
    <Box height={4}>
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("AB\n\n\n");
});

/**
 * Verifies that `height` accepts percentage values, calculating height relative
 * to the parent.
 */
test("set height in percent", () => {
  const output = renderToString(
    <Box height={6} flexDirection="column">
      <Box height="50%">
        <Text>A</Text>
      </Box>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("A\n\n\nB\n\n");
});

/**
 * Verifies that content exceeding the fixed `height` is cut off (clipped) if
 * not otherwise handled (e.g. by overflow).
 */
test("cut text over the set height", () => {
  const output = renderToString(
    <Box height={2}>
      <Text>AAAABBBBCCCC</Text>
    </Box>,
    { columns: 4 },
  );

  expect(output).toBe("AAAA\nBBBB");
});

/**
 * Verifies that `minHeight` ensures the box is at least a certain height, but
 * allows expansion if content requires more.
 */
test("set min height", () => {
  const smallerOutput = renderToString(
    <Box minHeight={4}>
      <Text>A</Text>
    </Box>,
  );

  expect(smallerOutput).toBe("A\n\n\n");

  const largerOutput = renderToString(
    <Box minHeight={2}>
      <Box height={4}>
        <Text>A</Text>
      </Box>
    </Box>,
  );

  expect(largerOutput).toBe("A\n\n\n");
});
