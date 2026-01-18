import { test, expect } from "bun:test";
import ansis from "ansis";
import { Box, Separator, Text } from "../src/index.js";
import { renderToString } from "./helpers/render-to-string.js";

/**
 * Verifies that the default Separator renders a horizontal line.
 * By default in renderToString without a container, it might have 0 width or default width.
 * We'll wrap it in a Box with fixed width to ensure it expands.
 */
test("Separator renders horizontal line filling width", () => {
  const output = renderToString(
    <Box width={5}>
      <Separator />
    </Box>,
  );
  expect(output).toBe("─────");
});

/**
 * Verifies custom character rendering.
 */
test("Separator renders with custom character", () => {
  const output = renderToString(
    <Box width={5}>
      <Separator char="=" />
    </Box>,
  );
  expect(output).toBe("=====");
});

/**
 * Verifies vertical separator rendering.
 */
test("Separator renders vertical line filling height", () => {
  const output = renderToString(
    <Box height={3} width={1}>
      <Separator direction="vertical" char="|" />
    </Box>,
  );
  expect(output).toBe("|\n|\n|");
});

/**
 * Verifies coloring.
 */
test("Separator supports color prop", () => {
  const output = renderToString(
    <Box width={5}>
      <Separator char="-" color="red" />
    </Box>,
  );
  expect(output).toBe(ansis.red("-----"));
});

/**
 * Verifies background color.
 */
test("Separator supports backgroundColor prop", () => {
  const output = renderToString(
    <Box width={5}>
      <Separator char=" " backgroundColor="blue" />
    </Box>,
  );
  expect(output).toBe(ansis.bgBlue("     "));
});

/**
 * Verifies dim color.
 */
test("Separator supports dimColor prop", () => {
  const output = renderToString(
    <Box width={5}>
      <Separator char="-" dimColor />
    </Box>,
  );
  expect(output).toBe(ansis.dim("-----"));
});

/**
 * Verifies bold style.
 */
test("Separator supports bold style", () => {
  const output = renderToString(
    <Box width={5}>
      <Separator char="-" bold />
    </Box>,
  );
  expect(output).toBe(ansis.bold("-----"));
});

/**
 * Verifies italic style.
 */
test("Separator supports italic style", () => {
  const output = renderToString(
    <Box width={5}>
      <Separator char="-" italic />
    </Box>,
  );
  expect(output).toBe(ansis.italic("-----"));
});

/**
 * Verifies underline style.
 */
test("Separator supports underline style", () => {
  const output = renderToString(
    <Box width={5}>
      <Separator char="-" underline />
    </Box>,
  );
  expect(output).toBe(ansis.underline("-----"));
});

/**
 * Verifies strikethrough style.
 */
test("Separator supports strikethrough style", () => {
  const output = renderToString(
    <Box width={5}>
      <Separator char="-" strikethrough />
    </Box>,
  );
  expect(output).toBe(ansis.strikethrough("-----"));
});

/**
 * Verifies inverse style.
 */
test("Separator supports inverse style", () => {
  const output = renderToString(
    <Box width={5}>
      <Separator char="-" inverse />
    </Box>,
  );
  expect(output).toBe(ansis.inverse("-----"));
});

/**
 * Verifies combined styles.
 */
test("Separator supports combined styles", () => {
  const output = renderToString(
    <Box width={5}>
      <Separator char="-" color="red" bold underline />
    </Box>,
  );

  // Implementation applies styles in order: color -> bold -> underline
  // So we expect: underline(bold(red("-----")))
  expect(output).toBe(ansis.underline(ansis.bold(ansis.red("-----"))));
});

/**
 * Verifies layout integration (horizontal separator between text).
 */
test("Separator fills space between text components", () => {
  const output = renderToString(
    <Box flexDirection="column" width={10}>
      <Text>Top</Text>
      <Separator />
      <Text>Bottom</Text>
    </Box>,
  );

  // Expect:
  // Top
  // ──────────
  // Bottom
  // Note: implementation details might add padding/wrapping, simplified expectation:
  expect(output).toContain("Top");
  expect(output).toContain("──────────");
  expect(output).toContain("Bottom");
});
