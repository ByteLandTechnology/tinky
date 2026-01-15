/**
 * Tests for overflow behavior with scrollable content containers.
 *
 * This test simulates the use case where:
 * - A container has a fixed height (terminal height or explicit value)
 * - An inner container uses flexGrow to fill available space
 * - Content inside may overflow the inner container
 * - The overflow should be clipped and borders should not be covered
 */

import { test, expect } from "bun:test";
import { Box, Text } from "../src/index.js";
import { renderToString } from "./helpers/render-to-string.js";

/**
 * Verifies that when content overflows an inner container, the outer
 * container's borders remains visible and correctly positioned.
 * This simulates a scroll view scenario where inner content exceeds available
 * space.
 */
test("overflow - outer borders should be visible when content overflows inner container", () => {
  // When content overflows an inner container, the outer container's borders
  // should still be visible (rendered at the correct position).
  // Note: Inner borders may be covered by overflowing content - this is expected.
  const output = renderToString(
    <Box width={40} height={10} borderStyle="round" flexDirection="column">
      <Text>Header</Text>
      <Box
        flexGrow={1}
        width="100%"
        borderStyle="single"
        flexDirection="column"
      >
        {/* Content that overflows the inner container */}
        <Text>Line 1</Text>
        <Text>Line 2</Text>
        <Text>Line 3</Text>
        <Text>Line 4</Text>
        <Text>Line 5</Text>
        <Text>Line 6</Text>
        <Text>Line 7</Text>
        <Text>Line 8</Text>
        <Text>Line 9</Text>
        <Text>Line 10</Text>
      </Box>
    </Box>,
  );

  // The outer border should be visible
  expect(output.includes("╭"), "Outer top border should be visible").toBeTrue();
  expect(
    output.includes("╰"),
    "Outer bottom border should be visible",
  ).toBeTrue();
  expect(
    output.includes("╯"),
    "Outer bottom border corner should be visible",
  ).toBeTrue();

  // The inner top border should be visible
  expect(output.includes("┌"), "Inner top border should be visible").toBeTrue();
  // Note: Inner bottom border (└) may be covered by overflowing content

  // Output should respect the fixed height of 10 lines
  const lines = output.split("\n");
  expect(lines.length, "Output should be 10 lines high").toBe(10);
});

/**
 * Verifies that using `overflow="hidden"` on an inner container preserves the
 * outer container's integrity (borders) even when content would otherwise
 * overflow.
 */
test("overflow - overflow hidden should preserve borders even with overflowing content", () => {
  // Note: overflow="hidden" alone does not constrain height in flexbox layout.
  // The container will still expand to fit content. However, borders should
  // always be present and not be overwritten by child content.
  const output = renderToString(
    <Box width={30} height={8} borderStyle="round" flexDirection="column">
      <Text>Title</Text>
      <Box flexGrow={1} width="100%" overflow="hidden" flexDirection="column">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
        <Text>Item 4</Text>
        <Text>Item 5</Text>
        <Text>Item 6</Text>
        <Text>Item 7</Text>
        <Text>Item 8</Text>
      </Box>
    </Box>,
  );

  // Outer border should be complete - this is the key requirement
  expect(output.includes("╭"), "Top-left corner should be present").toBeTrue();
  expect(output.includes("╮"), "Top-right corner should be present").toBeTrue();
  expect(
    output.includes("╰"),
    "Bottom-left corner should be present",
  ).toBeTrue();
  expect(
    output.includes("╯"),
    "Bottom-right corner should be present",
  ).toBeTrue();
});

/**
 * Verifies that `height="100%"` works correctly when nested inside a
 * fixed-height parent, ensuring layout consistency.
 */
test("overflow - height 100% should work when parent has fixed height", () => {
  // This test verifies that height="100%" works correctly
  // when wrapped in a parent with explicit fixed height
  const output = renderToString(
    <Box width={50} height={15} flexDirection="column">
      <Box
        width="100%"
        height="100%"
        borderStyle="round"
        flexDirection="column"
      >
        <Text>Full height container</Text>
        <Box
          flexGrow={1}
          width="100%"
          borderStyle="single"
          overflow="hidden"
          flexDirection="column"
        >
          <Text>Content 1</Text>
          <Text>Content 2</Text>
          <Text>Content 3</Text>
        </Box>
      </Box>
    </Box>,
    { columns: 50 },
  );

  const lines = output.split("\n");

  // Should be exactly 15 lines high (fixed container height)
  expect(lines.length, "Output should match the fixed height of 15 lines").toBe(
    15,
  );

  // Verify borders are present
  expect(
    output.includes("╭"),
    "Outer top-left corner should be present",
  ).toBeTrue();
  expect(
    output.includes("╰"),
    "Outer bottom-left corner should be present",
  ).toBeTrue();
  expect(
    output.includes("┌"),
    "Inner top-left corner should be present",
  ).toBeTrue();
  expect(
    output.includes("└"),
    "Inner bottom-left corner should be present",
  ).toBeTrue();
});

/**
 * Verifies that nested boxes with `flexGrow` respect the fixed height
 * constraint of their parent/ancestor.
 */
test("overflow - nested boxes with flexGrow should respect parent height constraints", () => {
  const output = renderToString(
    <Box width={50} height={12} borderStyle="double" flexDirection="column">
      <Text bold>Header Section</Text>
      <Text dimColor>Subtitle</Text>
      <Box flexGrow={1} width="100%" borderStyle="single" marginTop={1}>
        <Box width="100%" overflow="hidden" flexDirection="column">
          {Array.from({ length: 15 }, (_, i) => (
            <Text key={i}>Row {i + 1}</Text>
          ))}
        </Box>
      </Box>
    </Box>,
  );

  const lines = output.split("\n");

  // Should be exactly 12 lines high
  expect(
    lines.length,
    "Output should respect the height constraint of 12 lines",
  ).toBe(12);

  // Double border should be complete
  expect(
    output.includes("╔"),
    "Double border top-left should be present",
  ).toBeTrue();
  expect(
    output.includes("╚"),
    "Double border bottom-left should be present",
  ).toBeTrue();
});
