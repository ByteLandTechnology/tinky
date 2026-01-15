import { test, expect } from "bun:test";
import { Box, Text } from "../src/index.js";
import { renderToString } from "./helpers/render-to-string.js";

/**
 * Verifies that fractional (`fr`) units are correctly supported in grid
 * templates.
 */
test("grid fr units", () => {
  const output = renderToString(
    <Box
      display="grid"
      gridTemplateColumns={[
        { min: 0, max: "1fr" },
        { min: 0, max: "2fr" },
      ]}
      width={30}
    >
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  // A gets 10 chars, B gets 20 chars
  expect(output).toBe("A         B");
});

/**
 * Verifies that `min-content` and `max-content` keywords are supported in grid
 * templates.
 */
test("grid min/max content", () => {
  const output = renderToString(
    <Box
      display="grid"
      gridTemplateColumns={[
        { min: "max-content", max: "max-content" },
        { min: "max-content", max: "max-content" },
      ]}
      gap={1}
    >
      <Text>Hi</Text>
      <Text>World</Text>
    </Box>,
  );

  // Hi is 2. World is 5. Gap 1.
  expect(output).toBe("Hi World");
});

/**
 * Verifies that `justifyItems` aligns items horizontally within their grid
 * cells.
 */
test("grid justify items center", () => {
  const output = renderToString(
    <Box display="grid" gridTemplateColumns={[10]} justifyItems="center">
      <Text>Hi</Text>
    </Box>,
  );

  // Column width 10. 'Hi' width 2.
  // Center: (10 - 2) / 2 = 4 start offset.
  expect(output).toBe("    Hi");
});

/**
 * Verifies that `alignItems` aligns items vertically within their grid cells.
 */
test("grid align items end", () => {
  const output = renderToString(
    <Box display="grid" gridTemplateRows={[3]} alignItems="end">
      <Text>A</Text>
    </Box>,
  );

  // Row height 3. 'A' height 1.
  expect(output).toBe("\n\nA");
});

/**
 * Verifies that `justifySelf` overrides `justifyItems` for a specific item.
 */
test("grid justify self", () => {
  const output = renderToString(
    <Box display="grid" gridTemplateColumns={[10]}>
      <Box justifySelf="end">
        <Text>X</Text>
      </Box>
    </Box>,
  );

  // X at end of 10.
  expect(output).toBe("         X");
});

/**
 * Verifies that `alignSelf` overrides `alignItems` for a specific item.
 */
test("grid align self", () => {
  const output = renderToString(
    <Box display="grid" gridTemplateRows={[3]}>
      <Box alignSelf="end">
        <Text>X</Text>
      </Box>
    </Box>,
  );

  // Row 3. End -> Row 3.
  expect(output).toBe("\n\nX");
});

/**
 * Verifies that `alignContent` distributes space between grid rows when the
 * grid is smaller than the container.
 */
test("grid align content end", () => {
  // Requires container to be larger than grid tracks
  const output = renderToString(
    <Box display="grid" gridTemplateRows={[1]} height={4} alignContent="end">
      <Text>X</Text>
    </Box>,
  );

  // Height 4. Grid content height 1.
  expect(output).toBe("\n\n\nX");
});
