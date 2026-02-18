import { test, expect } from "bun:test";
import ansis from "ansis";
import { render, Box, Text } from "../src/index.js";
import { renderToString } from "./helpers/render-to-string.js";
import { createStdout } from "./helpers/create-stdout.js";

// ANSI escape sequences for background colors
// Note: We test against raw ANSI codes because:
// 1. Different color reset patterns:
//    - Ansis: '\u001b[43mHello \u001b[49m\u001b[43mWorld\u001b[49m'
//      (individual resets)
//    - Tinky:   '\u001b[43mHello World\u001b[49m' (continuous blocks)
// 2. Background space fills that standard libraries don't generate:
//    - Tinky: '\u001b[41mHello     \u001b[49m\n\u001b[41m          \u001b[49m'
//      (fills entire Box area)
// 3. Context-aware color transitions:
//    - Ansis:
//      '\u001b[43mOuter: \u001b[49m\u001b[44mInner: \u001b[49m\u001b[41mExplicit\u001b[49m'
//    - Tinky:   '\u001b[43mOuter: \u001b[44mInner: \u001b[41mExplicit\u001b[49m'
//      (no intermediate resets)
const ansi = {
  // Standard colors
  bgRed: "\u001B[41m",
  bgGreen: "\u001B[42m",
  bgYellow: "\u001B[43m",
  bgBlue: "\u001B[44m",
  bgMagenta: "\u001B[45m",
  bgCyan: "\u001B[46m",

  // Hex/RGB colors (24-bit)
  bgHexRed: "\u001B[48;2;255;0;0m", // #FF0000 or rgb(255,0,0)

  // ANSI256 colors
  bgAnsi256Nine: "\u001B[48;5;9m", // Ansi256(9)

  // Reset
  bgReset: "\u001B[49m",
} as const;

const supportsAnsi = ansis.isSupported();

/**
 * Text inheritance tests (these work in non-TTY)
 */
/**
 * Verifies that a `<Text>` component inherits the background color from its
 * parent `<Box>`. When a Box has a background color, all text content within it
 * should be rendered on top of that background.
 */
test("Text inherits parent Box background color", () => {
  const output = renderToString(
    <Box backgroundColor="green" alignSelf="flex-start">
      <Text>Hello World</Text>
    </Box>,
  );

  expect(output).toBe(ansis.bgGreen("Hello World"));
});

/**
 * Verifies that an explicit background color on a `<Text>` component overrides
 * the inherited background color from its parent `<Box>`. The Text's specific
 * style should take precedence over the container's style.
 */
test("Text explicit background color overrides inherited", () => {
  const output = renderToString(
    <Box backgroundColor="red" alignSelf="flex-start">
      <Text backgroundColor="blue">Hello World</Text>
    </Box>,
  );

  expect(output).toBe(ansis.bgBlue("Hello World"));
});

/**
 * Verifies background color inheritance through multiple levels of nested
 * `<Box>` components. The inner Box's background color should override the outer
 * Box's background color for its content.
 */
test("Nested Box background inheritance", () => {
  const output = renderToString(
    <Box backgroundColor="red" alignSelf="flex-start">
      <Box backgroundColor="blue">
        <Text>Hello World</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe(ansis.bgBlue("Hello World"));
});

/**
 * Verifies that a `<Text>` component does not inherit any background color if
 * its parent `<Box>` does not define one. The output should be plain text
 * without ANSI background codes.
 */
test("Text without parent Box background has no inheritance", () => {
  const output = renderToString(
    <Box alignSelf="flex-start">
      <Text>Hello World</Text>
    </Box>,
  );

  expect(output).toBe("Hello World");
});

/**
 * Verifies that multiple sibling `<Text>` components all inherit the background
 * color from their shared parent `<Box>`. The background should appear
 * continuous across the text elements.
 */
test("Multiple Text elements inherit same background", () => {
  const output = renderToString(
    <Box backgroundColor="yellow" alignSelf="flex-start">
      <Text>Hello </Text>
      <Text>World</Text>
    </Box>,
  );

  // Text nodes are rendered as a single block with shared background
  expect(output).toBe(ansis.bgYellow("Hello World"));
});

/**
 * Verifies that siblings in a `<Box>` with a background color can selectively
 * override or remove that background.
 * - Inherited: Should have the parent's background.
 * - No BG: Should have no background (reset).
 * - Red BG: Should have its own red background.
 */
test("Mixed text with and without background inheritance", () => {
  const output = renderToString(
    <Box backgroundColor="green" alignSelf="flex-start">
      <Text>Inherited </Text>
      <Text backgroundColor="">No BG </Text>
      <Text backgroundColor="red">Red BG</Text>
    </Box>,
  );

  expect(output).toBe(
    ansis.bgGreen("Inherited ") + "No BG " + ansis.bgRed("Red BG"),
  );
});

/**
 * Verifies complex background inheritance with deeply nested structures. It
 * ensures that background colors transition correctly between outer and inner
 * containers without unnecessary reset codes in between, using Tinky's optimized
 * rendering.
 */
test("Complex nested structure with background inheritance", () => {
  const output = renderToString(
    <Box backgroundColor="yellow" alignSelf="flex-start">
      <Box>
        <Text>Outer: </Text>
        <Box backgroundColor="blue">
          <Text>Inner: </Text>
          <Text backgroundColor="red">Explicit</Text>
        </Box>
      </Box>
    </Box>,
  );

  expect(output).toBe(
    ansis.bgYellow("Outer: ") +
      ansis.bgBlue("Inner: ") +
      ansis.bgRed("Explicit"),
  );
});

/**
 * Background color tests for different formats.
 */
/**
 * Verifies that `<Box>` correctly applies a standard ANSI background color
 * (e.g., 'red') to its text content.
 */
test("Box background with standard color", () => {
  const output = renderToString(
    <Box backgroundColor="red" alignSelf="flex-start">
      <Text>Hello</Text>
    </Box>,
  );

  expect(output).toBe(ansis.bgRed("Hello"));
});

/**
 * Verifies that `<Box>` correctly applies a hex background color
 * (e.g., '#FF0000') to its text content. This ensures support for 24-bit
 * TrueColor backgrounds.
 */
test("Box background with hex color", () => {
  const output = renderToString(
    <Box backgroundColor="#FF0000" alignSelf="flex-start">
      <Text>Hello</Text>
    </Box>,
  );

  expect(output).toBe(ansis.bgHex("#FF0000")("Hello"));
});

/**
 * Verifies that `<Box>` correctly applies an RGB background color
 * (e.g., 'rgb(255, 0, 0)') to its text content. This also ensures TrueColor
 * support using the RGB function syntax.
 */
test("Box background with rgb color", () => {
  const output = renderToString(
    <Box backgroundColor="rgb(255, 0, 0)" alignSelf="flex-start">
      <Text>Hello</Text>
    </Box>,
  );

  expect(output).toBe(ansis.bgRgb(255, 0, 0)("Hello"));
});

/**
 * Verifies that `<Box>` correctly applies an ANSI 256 background color
 * (e.g., 'ansi256(9)') to its text content. This ensures support for the
 * 256-color palette.
 */
test("Box background with ansi256 color", () => {
  const output = renderToString(
    <Box backgroundColor="ansi256(9)" alignSelf="flex-start">
      <Text>Hello</Text>
    </Box>,
  );

  expect(output).toBe(ansis.bg(9)("Hello"));
});

/**
 * Verifies that background color is correctly applied to wide characters (like
 * Japanese text). This ensures that background coloring respects character
 * width.
 */
test("Box background with wide characters", () => {
  const output = renderToString(
    <Box backgroundColor="yellow" alignSelf="flex-start">
      <Text>こんにちは</Text>
    </Box>,
  );

  expect(output).toBe(ansis.bgYellow("こんにちは"));
});

/**
 * Verifies that background color is correctly applied to emojis.
 * Similar to wide characters, emojis often take up multiple columns and should
 * be colored correctly.
 */
test("Box background with emojis", () => {
  const output = renderToString(
    <Box backgroundColor="red" alignSelf="flex-start">
      <Text>🎉🎊</Text>
    </Box>,
  );

  expect(output).toBe(ansis.bgRed("🎉🎊"));
});

/**
 * Box background space fill tests - these should work with forced colors.
 */
/**
 * Verifies that when a `<Box>` has dimensions (width/height) larger than its
 * content, the background color fills the entire area, including the empty
 * space. This checks for proper space filling with standard colors.
 */
test("Box background fills entire area with standard color", () => {
  const output = renderToString(
    <Box backgroundColor="red" width={10} height={3} alignSelf="flex-start">
      <Text>Hello</Text>
    </Box>,
  );

  expect(output.includes("Hello"), "Should contain the text").toBeTrue();
  expect(output.split("\n").length).toBe(3);

  if (supportsAnsi) {
    expect(
      output.includes(ansi.bgRed),
      "Should contain red background start code",
    ).toBeTrue();
    expect(
      output.includes(ansi.bgReset),
      "Should contain background reset code",
    ).toBeTrue();
  }
});

/**
 * Verifies that when a `<Box>` has fixed dimensions, the hex background color
 * fills the entire area. This ensures area filling works correctly with
 * TrueColor hex values.
 */
test("Box background fills with hex color", () => {
  const output = renderToString(
    <Box backgroundColor="#FF0000" width={10} height={3} alignSelf="flex-start">
      <Text>Hello</Text>
    </Box>,
  );

  expect(output.includes("Hello"), "Should contain the text").toBeTrue();
  if (supportsAnsi) {
    expect(
      output.includes(ansi.bgHexRed),
      "Should contain hex RGB background code",
    ).toBeTrue();
    expect(
      output.includes(ansi.bgReset),
      "Should contain background reset code",
    ).toBeTrue();
  }
});

/**
 * Verifies that when a `<Box>` has fixed dimensions, the rgb background color
 * fills the entire area. This ensures area filling works correctly with
 * TrueColor rgb values.
 */
test("Box background fills with rgb color", () => {
  const output = renderToString(
    <Box
      backgroundColor="rgb(255, 0, 0)"
      width={10}
      height={3}
      alignSelf="flex-start"
    >
      <Text>Hello</Text>
    </Box>,
  );

  expect(output.includes("Hello"), "Should contain the text").toBeTrue();
  if (supportsAnsi) {
    expect(
      output.includes(ansi.bgHexRed),
      "Should contain RGB background code",
    ).toBeTrue();
    expect(
      output.includes(ansi.bgReset),
      "Should contain background reset code",
    ).toBeTrue();
  }
});

/**
 * Verifies that when a `<Box>` has fixed dimensions, the ANSI 256 background
 * color fills the entire area. This ensures area filling works correctly with
 * 256-color palette.
 */
test("Box background fills with ansi256 color", () => {
  const output = renderToString(
    <Box
      backgroundColor="ansi256(9)"
      width={10}
      height={3}
      alignSelf="flex-start"
    >
      <Text>Hello</Text>
    </Box>,
  );

  expect(output.includes("Hello"), "Should contain the text").toBeTrue();
  if (supportsAnsi) {
    expect(
      output.includes(ansi.bgAnsi256Nine),
      "Should contain ANSI256 background code",
    ).toBeTrue();
    expect(
      output.includes(ansi.bgReset),
      "Should contain background reset code",
    ).toBeTrue();
  }
});

/**
 * Verifies that `<Box>` background color fills the content area correctly even
 * when a border is present. The background should appear inside the border, and
 * the border characters themselves should typically sit on top or around the
 * background fill.
 */
test("Box background with border fills content area", () => {
  const output = renderToString(
    <Box
      backgroundColor="cyan"
      borderStyle="round"
      width={10}
      height={5}
      alignSelf="flex-start"
    >
      <Text>Hi</Text>
    </Box>,
  );

  expect(output.includes("Hi"), "Should contain the text").toBeTrue();
  if (supportsAnsi) {
    expect(
      output.includes(ansi.bgCyan),
      "Should contain cyan background code",
    ).toBeTrue();
    expect(
      output.includes(ansi.bgReset),
      "Should contain background reset code",
    ).toBeTrue();
  }
  expect(output.includes("╭"), "Should contain top-left border").toBeTrue();
  expect(output.includes("╮"), "Should contain top-right border").toBeTrue();
});

/**
 * Verifies that `<Box>` background color fills the entire area including
 * padding. Space created by padding should be colored with the background
 * color.
 */
test("Box background with padding fills entire padded area", () => {
  const output = renderToString(
    <Box
      backgroundColor="magenta"
      padding={1}
      width={10}
      height={5}
      alignSelf="flex-start"
    >
      <Text>Hi</Text>
    </Box>,
  );

  expect(output.includes("Hi"), "Should contain the text").toBeTrue();
  if (supportsAnsi) {
    expect(
      output.includes(ansi.bgMagenta),
      "Should contain magenta background code",
    ).toBeTrue();
    expect(
      output.includes(ansi.bgReset),
      "Should contain background reset code",
    ).toBeTrue();
  }
});

/**
 * Verifies that `<Box>` background color fills the entire area even when
 * content is centered using `justifyContent`. The alignment of content should
 * not affect the background filling the specified width/height.
 */
test("Box background with center alignment fills entire area", () => {
  const output = renderToString(
    <Box
      backgroundColor="blue"
      width={10}
      height={3}
      justifyContent="center"
      alignSelf="flex-start"
    >
      <Text>Hi</Text>
    </Box>,
  );

  expect(output.includes("Hi"), "Should contain centered text").toBeTrue();
  if (supportsAnsi) {
    expect(
      output.includes(ansi.bgBlue),
      "Should contain blue background code",
    ).toBeTrue();
    expect(
      output.includes(ansi.bgReset),
      "Should contain background reset code",
    ).toBeTrue();
  }
});

/**
 * Verifies that `<Box>` background color work correctly with
 * `flexDirection="column"`. Specifically ensures that multiple lines of text in
 * a column layout are all backed by the background color.
 */
test("Box background with column layout fills entire area", () => {
  const output = renderToString(
    <Box
      backgroundColor="green"
      flexDirection="column"
      width={10}
      height={5}
      alignSelf="flex-start"
    >
      <Text>Line 1</Text>
      <Text>Line 2</Text>
    </Box>,
  );

  expect(
    output.includes("Line 1"),
    "Should contain first line text",
  ).toBeTrue();
  expect(
    output.includes("Line 2"),
    "Should contain second line text",
  ).toBeTrue();
  if (supportsAnsi) {
    expect(
      output.includes(ansi.bgGreen),
      "Should contain green background code",
    ).toBeTrue();
    expect(
      output.includes(ansi.bgReset),
      "Should contain background reset code",
    ).toBeTrue();
  }
});

/**
 * Update tests using render() for comprehensive coverage.
 */
/**
 * Verifies that background color updates correctly when props change during a
 * re-render. It checks the initial state (no bg), updated state (green bg), and
 * reverted state (no bg).
 */
test("Box background updates on rerender", () => {
  const stdout = createStdout();

  function Test({ bgColor }: { readonly bgColor?: string }) {
    return (
      <Box backgroundColor={bgColor} alignSelf="flex-start">
        <Text>Hello</Text>
      </Box>
    );
  }

  const { rerender } = render(<Test />, {
    stdout,
    debug: true,
  });

  expect(stdout.get()).toBe("Hello");

  rerender(<Test bgColor="green" />);
  expect(stdout.get()).toBe(ansis.bgGreen("Hello"));

  rerender(<Test />);
  expect(stdout.get()).toBe("Hello");
});
