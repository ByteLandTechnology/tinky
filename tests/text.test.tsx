import { test, expect } from "bun:test";
import chalk from "chalk";
import { render, Box, Text } from "../src/index.js";
import { renderToString } from "./helpers/render-to-string.js";
import {
  styledCharsFromTokens,
  styledCharsToString,
  tokenize,
} from "@alcalzone/ansi-tokenize";
import { createStdout } from "./helpers/create-stdout.js";

/**
 * Verifies that a `<Text>` component with no children renders nothing (empty
 * string).
 */
test("<Text> with undefined children", () => {
  const output = renderToString(<Text />);
  expect(output).toBe("");
});

/**
 * Verifies that a `<Text>` component explicitly passed `null` as child renders
 * nothing.
 */
test("<Text> with null children", () => {
  const output = renderToString(<Text>{null}</Text>);
  expect(output).toBe("");
});

/**
 * Verifies that text color props (e.g. `color="green"`) are correctly applied
 * using ANSI codes.
 */
test("text with standard color", () => {
  const output = renderToString(<Text color="green">Test</Text>);
  expect(output).toBe(chalk.green("Test"));
});

/**
 * Verifies that text styling props (`dimColor`, `bold`) are correctly applied
 * and combined.
 */
test("text with dim+bold", () => {
  const output = renderToString(
    <Text dimColor bold>
      Test
    </Text>,
  );
  expect(output).toEqual(
    styledCharsToString(
      styledCharsFromTokens(tokenize(chalk.bold.dim("Test"))),
    ),
  );
});

/**
 * Verifies that `dimColor` can be combined with standard colors (e.g. green).
 */
test("text with dimmed color", () => {
  const output = renderToString(
    <Text dimColor color="green">
      Test
    </Text>,
  );

  // Handle non-deterministic order of ANSI codes (dim+green or green+dim)
  expect(output).toBe(chalk.green.dim("Test"));
});

/**
 * Verifies support for hexadecimal color codes.
 */
test("text with hex color", () => {
  const output = renderToString(<Text color="#FF8800">Test</Text>);
  expect(output).toBe(chalk.hex("#FF8800")("Test"));
});

/**
 * Verifies support for RGB color strings.
 */
test("text with rgb color", () => {
  const output = renderToString(<Text color="rgb(255, 136, 0)">Test</Text>);
  expect(output).toBe(chalk.rgb(255, 136, 0)("Test"));
});

/**
 * Verifies support for ANSI-256 color codes.
 */
test("text with ansi256 color", () => {
  const output = renderToString(<Text color="ansi256(194)">Test</Text>);
  expect(output).toBe(chalk.ansi256(194)("Test"));
});

/**
 * Verifies support for standard background colors.
 */
test("text with standard background color", () => {
  const output = renderToString(<Text backgroundColor="green">Test</Text>);
  expect(output).toBe(chalk.bgGreen("Test"));
});

/**
 * Verifies support for hexadecimal background colors.
 */
test("text with hex background color", () => {
  const output = renderToString(<Text backgroundColor="#FF8800">Test</Text>);
  expect(output).toBe(chalk.bgHex("#FF8800")("Test"));
});

/**
 * Verifies support for RGB background colors.
 */
test("text with rgb background color", () => {
  const output = renderToString(
    <Text backgroundColor="rgb(255, 136, 0)">Test</Text>,
  );

  expect(output).toBe(chalk.bgRgb(255, 136, 0)("Test"));
});

/**
 * Verifies support for ANSI-256 background colors.
 */
test("text with ansi256 background color", () => {
  const output = renderToString(
    <Text backgroundColor="ansi256(194)">Test</Text>,
  );

  expect(output).toBe(chalk.bgAnsi256(194)("Test"));
});

/**
 * Verifies support for the `inverse` style (swapping foreground and
 * background).
 */
test("text with inversion", () => {
  const output = renderToString(<Text inverse>Test</Text>);
  expect(output).toBe(chalk.inverse("Test"));
});

/**
 * Verifies that text content is re-measured and updated correctly when the
 * text string changes.
 */
test("remeasure text when text is changed", () => {
  function Test({ add }: { readonly add?: boolean }) {
    return (
      <Box>
        <Text>{add ? "abcx" : "abc"}</Text>
      </Box>
    );
  }

  const stdout = createStdout();
  const { rerender } = render(<Test />, { stdout, debug: true });
  expect(stdout.get()).toBe("abc");

  rerender(<Test add />);
  expect(stdout.get()).toBe("abcx");
});

/**
 * Verifies that text is re-measured correctly when new text nodes (children
 * components) are added.
 */
test("remeasure text when text nodes are changed", () => {
  function Test({ add }: { readonly add?: boolean }) {
    return (
      <Box>
        <Text>
          abc
          {add && <Text>x</Text>}
        </Text>
      </Box>
    );
  }

  const stdout = createStdout();

  const { rerender } = render(<Test />, { stdout, debug: true });
  expect(stdout.get()).toBe("abc");

  rerender(<Test add />);
  expect(stdout.get()).toBe("abcx");
});

/**
 * Verifies that the string "constructor" does not cause issues when rendered.
 * This is a regression test for a specific bug where "constructor" could
 * conflict with object properties.
 */
test('text with content "constructor" wraps correctly', () => {
  const output = renderToString(<Text>constructor</Text>);
  expect(output).toBe("constructor");
});
