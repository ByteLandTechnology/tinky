import { test, expect } from "bun:test";
import { Box, Text } from "../src/index.js";
import { renderToString } from "./helpers/render-to-string.js";

/**
 * Verifies that `gridTemplateColumns` defines column sizes in a grid layout.
 */
test("grid template columns", () => {
  const output = renderToString(
    <Box display="grid" gridTemplateColumns={[1, 1]} width={4}>
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("AB");
});

/**
 * Verifies that `gridTemplateRows` defines row sizes in a grid layout.
 */
test("grid template rows", () => {
  const output = renderToString(
    <Box display="grid" gridTemplateRows={[1, 1]} height={2}>
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("A\nB");
});

/**
 * Verifies that `gridAutoFlow="column"` fills the grid column-by-column rather
 * than row-by-row.
 */
test("grid auto flow column", () => {
  const output = renderToString(
    <Box
      display="grid"
      gridAutoFlow="column"
      gridTemplateRows={[1, 1]}
      height={2}
    >
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("A\nB");
});

/**
 * Verifies that `columnGap` adds horizontal space between grid columns.
 */
test("grid column gap", () => {
  const output = renderToString(
    <Box display="grid" gridTemplateColumns={[1, 1]} columnGap={1}>
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("A B");
});

/**
 * Verifies that `rowGap` adds vertical space between grid rows.
 */
test("grid row gap", () => {
  const output = renderToString(
    <Box display="grid" gridTemplateRows={[1, 1]} rowGap={1}>
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  expect(output).toBe("A\n\nB");
});

/**
 * Verifies explicit grid item placement using `gridColumn` and `gridRow`.
 */
test("grid placement", () => {
  const output = renderToString(
    <Box display="grid" gridTemplateColumns={[1, 1]} width={4}>
      <Box gridColumn={{ start: 2, end: "auto" }}>
        <Text>B</Text>
      </Box>
      <Box
        gridColumn={{ start: 1, end: "auto" }}
        gridRow={{ start: 1, end: "auto" }}
      >
        <Text>A</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("AB");
});

/**
 * Verifies complex grid item spanning using `gridColumn` spans.
 */
test("grid complex placement", () => {
  const output = renderToString(
    <Box display="grid" gridTemplateColumns={[1, 1]} width={2}>
      <Box gridColumn={{ start: 1, end: 3 }}>
        <Text>AA</Text>
      </Box>
      <Text>B</Text>
      <Text>C</Text>
    </Box>,
  );

  expect(output).toBe("AA\nBC");
});
