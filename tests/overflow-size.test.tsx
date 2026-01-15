/**
 * Test file for verifying overflow="hidden" box size calculation.
 *
 * This test suite verifies that when a box has overflow="hidden",
 * its size calculation is NOT affected by its child elements that
 * exceed the box's specified dimensions.
 *
 * The core issue being tested:
 * - When overflow is "hidden", the parent box should maintain its
 *   specified size regardless of child content dimensions.
 * - The child content should be clipped, but the parent's layout
 *   dimensions should not grow to accommodate the child.
 */

import { test, expect } from "bun:test";
import { Box, Text } from "../src/index.js";
import { renderToString } from "./helpers/render-to-string.js";

// ============================================================================
// Test Group 0: Layout Width dependence on Overflow Style
// ============================================================================

/**
 * Verifies that layout width calculation is affected by `overflow="hidden"`.
 * With `overflow="hidden"`, a container should be able to shrink below its
 * content's size if constrained by parent, whereas `overflow="visible"` forces
 * it to expand to accommodate content.
 */
test("verify layout width depends on overflow style", () => {
  // This test does not set an explicit width for the box with overflow="hidden".
  // It is placed as a flex item inside a container with width 10.

  // Expected behavior:
  // Expected behavior:
  // 1. If Taffy recognizes overflow="hidden", this box should shrink to 10
  //    (even if the child is 20 wide). The rendered output should be clipped to
  //    10 characters.
  // 2. If Taffy does not know (i.e. visible), this box will be expanded by the
  //    child to 20. The rendered result will show 20 characters.

  // If applyOverflowStyles is disabled, the Layout Width here will be 20,
  // and the output length will be 20.
  // If applyOverflowStyles is active, the Layout Width here is 10, and the
  // output length is 10.

  const output = renderToString(
    <Box width={10}>
      <Box overflow="hidden" flexGrow={1}>
        <Box width={20} flexShrink={0}>
          <Text>12345678901234567890</Text>
        </Box>
      </Box>
    </Box>,
  );

  const line = output.split("\n").find((l) => l.length > 0);

  expect(
    line?.length,
    `Width should be constrained to 10. actual: ${line?.length}`,
  ).toBe(10);
});

/**
 * Verifies that `overflowX="hidden"` similarly allows width shrinking
 * constraints to be respected.
 */
test("verify layout width depends on overflowX style", () => {
  const output = renderToString(
    <Box width={10}>
      {/* overflowX="hidden" should also allow shrinking */}
      <Box overflowX="hidden" flexGrow={1}>
        <Box width={20} flexShrink={0}>
          <Text>12345678901234567890</Text>
        </Box>
      </Box>
    </Box>,
  );

  const line = output.split("\n").find((l) => l.length > 0);

  expect(
    line?.length,
    `Width should be constrained to 10 with overflowX="hidden". actual: ${line?.length}`,
  ).toBe(10);
});

/**
 * Verifies that `overflowY="hidden"` allows height shrinking constraints to be
 * respected (clipping vertical content).
 */
test("verify layout height depends on overflowY style", () => {
  const output = renderToString(
    <Box height={3} flexDirection="column">
      {/* overflowY="hidden" should allow shrinking vertically */}
      <Box overflowY="hidden" flexGrow={1}>
        <Box height={10} flexShrink={0}>
          <Text>
            L1{"\n"}L2{"\n"}L3{"\n"}L4{"\n"}L5{"\n"}L6
          </Text>
        </Box>
      </Box>
    </Box>,
  );

  const lines = output.split("\n").filter((l) => l.length > 0);

  // The container is height 3. The inner box should shrink to fill it.
  // Max lines should be 3.
  expect(
    lines.length <= 3,
    `Height should be constrained to 3 with overflowY="hidden". actual lines: ${lines.length}`,
  ).toBeTrue();
});

/**
 * Control test: verify that without `overflow="hidden"` (i.e. `visible`), value
 * expands to content size and overflows parent.
 */
test('verify layout width with overflow="visible" does NOT shrink below content size', () => {
  const output = renderToString(
    <Box width={10}>
      {/* With overflow="visible", min-width should be "auto" (content size),
          which is 20. So it should overflow the parent width of 10. */}
      <Box overflow="visible" flexGrow={1} flexShrink={1}>
        <Box width={20} flexShrink={0}>
          <Text>12345678901234567890</Text>
        </Box>
      </Box>
    </Box>,
  );

  const line = output.split("\n").find((l) => l.length > 0);

  expect(
    line?.length,
    `With overflow="visible", item should not shrink below content width (20). actual: ${line?.length}`,
  ).toBe(20);
});

// ============================================================================
// Test Group 1: Basic overflow="hidden" size constraints (width)
// ============================================================================

/**
 * Verifies that `overflow="hidden"` ensures a container's size matches its
 * explicit width, ignoring larger children.
 */
test("overflow hidden - parent width should NOT be affected by wider child", () => {
  const output = renderToString(
    <Box width={10}>
      <Box width={5} overflow="hidden">
        {/* Child is wider than parent */}
        <Box width={20} flexShrink={0}>
          <Text>12345678901234567890</Text>
        </Box>
      </Box>
    </Box>,
  );

  // The parent box with overflow="hidden" and width=5 should only be 5
  // characters wide.
  // If the bug exists, it would expand to accommodate the child's 20-character
  // width
  const lines = output.split("\n");
  const maxWidth = Math.max(...lines.map((line) => line.length));

  // The output should be at most 10 characters wide (outer container)
  // The inner box with overflow="hidden" should be 5 characters wide
  expect(
    maxWidth <= 10,
    `Expected max width <= 10, but got ${maxWidth}. Output:\n${output}`,
  ).toBeTrue();
});

/**
 * Same as above, verifying correct clipping of content to explicit width.
 */
test("overflow hidden - parent should display specified width even with larger child", () => {
  const output = renderToString(
    <Box width={6} overflow="hidden">
      <Box width={20} flexShrink={0}>
        <Text>ABCDEFGHIJKLMNOPQRST</Text>
      </Box>
    </Box>,
  );

  // The output should be exactly 6 characters wide, showing "ABCDEF"
  const lines = output.split("\n").filter((line) => line.length > 0);
  expect(lines.length, "Should have exactly 1 line of output").toBe(1);
  expect(
    lines[0]?.length,
    `Expected width of 6, got ${lines[0]?.length}. Output: "${lines[0]}"`,
  ).toBe(6);
  expect(lines[0], "Content should be clipped to first 6 characters").toBe(
    "ABCDEF",
  );
});

// ============================================================================
// Test Group 2: Basic overflow="hidden" size constraints (height)
// ============================================================================

/**
 * Verifies that explicit height is respected with `overflow="hidden"`, ignoring
 * taller children.
 */
test("overflow hidden - parent height should NOT be affected by taller child", () => {
  const output = renderToString(
    <Box height={3} overflow="hidden" flexDirection="column">
      {/* Child has more lines than parent height allows */}
      <Box height={10} flexShrink={0}>
        <Text>
          Line1{"\n"}Line2{"\n"}Line3{"\n"}Line4{"\n"}Line5{"\n"}Line6{"\n"}
          Line7
          {"\n"}Line8{"\n"}Line9{"\n"}Line10
        </Text>
      </Box>
    </Box>,
  );

  // The parent box with overflow="hidden" and height=3 should only show 3 lines
  const lines = output.split("\n");

  // If overflow is working correctly, we should see at most 3 non-empty lines
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
  expect(
    nonEmptyLines.length <= 3,
    `Expected at most 3 lines, but got ${nonEmptyLines.length}. Output:\n${output}`,
  ).toBeTrue();
});

/**
 * Verifies `overflowY="hidden"` respects height constraints similarly.
 */
test("overflowY hidden - parent height should NOT be affected by taller child", () => {
  const output = renderToString(
    <Box height={2} overflowY="hidden" flexDirection="column">
      <Box flexShrink={0}>
        <Text>
          Line1{"\n"}Line2{"\n"}Line3{"\n"}Line4
        </Text>
      </Box>
    </Box>,
  );

  // Should only show 2 lines
  const lines = output.split("\n");
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
  expect(
    nonEmptyLines.length <= 2,
    `Expected at most 2 lines, but got ${nonEmptyLines.length}. Output:\n${output}`,
  ).toBeTrue();
});

// ============================================================================
// Test Group 3: Combined width and height with overflow hidden
// ============================================================================

/**
 * Verifies that combined `overflow="hidden"` on both dimensions correctly
 * constrains both width and height.
 */
test("overflow hidden - both width and height should be constrained", () => {
  const output = renderToString(
    <Box width={4} height={2} overflow="hidden">
      <Box width={10} height={5} flexShrink={0}>
        <Text>
          1234567890{"\n"}ABCDEFGHIJ{"\n"}!@#$%^&*(){"\n"}qwertyuiop{"\n"}
          ZXCVBNM
        </Text>
      </Box>
    </Box>,
  );

  const lines = output.split("\n");

  // Check height constraint: should be at most 2 lines
  const nonEmptyLines = lines.filter((line) => line.length > 0);
  expect(
    nonEmptyLines.length <= 2,
    `Height constraint failed: expected <= 2 lines, got ${nonEmptyLines.length}`,
  ).toBeTrue();

  // Check width constraint: each line should be at most 4 characters
  for (const line of nonEmptyLines) {
    expect(
      line.length <= 4,
      `Width constraint failed: expected <= 4 chars, got ${line.length} for line "${line}"`,
    ).toBeTrue();
  }
});

// ============================================================================
// Test Group 4: Nested overflow hidden containers
// ============================================================================

/**
 * Verifies that nested containers independently respect their own overflow
 * constraints.
 */
test("nested overflow hidden - inner container should respect its own constraints", () => {
  const output = renderToString(
    <Box width={10} overflow="hidden">
      <Box width={6} overflow="hidden">
        <Box width={20} flexShrink={0}>
          <Text>ABCDEFGHIJKLMNOPQRST</Text>
        </Box>
      </Box>
    </Box>,
  );

  // Inner box has width=6 with overflow=hidden
  // Should clip to 6 characters
  const line = output.split("\n").find((line) => line.length > 0);
  expect(
    line?.length,
    `Expected inner width of 6, got ${line?.length}. Output: "${line}"`,
  ).toBe(6);
});

// ============================================================================
// Test Group 5: overflow hidden with flexShrink
// ============================================================================

/**
 * Verifies that rigid children (flexShrink=0) do not force parent expansion
 * when parent has `overflow="hidden"`.
 */
test("overflow hidden child with flexShrink=0 should not affect parent size", () => {
  const output = renderToString(
    <Box width={8} overflow="hidden">
      <Box width={4} flexShrink={0}>
        <Text>AAAA</Text>
      </Box>
      <Box width={4} flexShrink={0}>
        <Text>BBBB</Text>
      </Box>
      <Box width={4} flexShrink={0}>
        <Text>CCCC</Text>
      </Box>
    </Box>,
  );

  // Total child width is 12 (3 * 4), but parent is 8 with overflow=hidden
  // Should only show first 8 characters
  const line = output.split("\n").find((line) => line.length > 0);
  expect(
    (line?.length ?? 0) <= 8,
    `Expected width <= 8, got ${line?.length}. Output: "${line}"`,
  ).toBeTrue();
});

// ============================================================================
// Test Group 6: overflow hidden with border
// ============================================================================

/**
 * Verifies that `overflow="hidden"` constraints work correctly with bordered
 * containers.
 */
test("overflow hidden with border - content area should be constrained", () => {
  const output = renderToString(
    <Box width={8} height={4} overflow="hidden" borderStyle="round">
      <Box width={20} height={10} flexShrink={0}>
        <Text>
          ABCDEFGHIJKLMNOPQRST{"\n"}
          12345678901234567890{"\n"}
          !@#$%^&*()!@#$%^&*(){"\n"}
          qwertyuiopasdfghjklz
        </Text>
      </Box>
    </Box>,
  );

  const lines = output.split("\n");

  // With border, the box should be 8 chars wide and 4 lines tall total
  // Content area is 6x2 (subtracting 2 for left/right border, 2 for top/bottom border)
  expect(lines.length).toBe(4);

  for (const line of lines) {
    expect(
      line.length <= 8,
      `Expected width <= 8, got ${line.length} for line "${line}"`,
    ).toBeTrue();
  }
});

// ============================================================================
// Test Group 7: overflowX vs overflowY
// ============================================================================

/**
 * Verifies correct independent behavior of `overflowX` vs `overflowY`.
 * Here `overflowX="hidden"` implies horizontal clipping but
 * `overflowY="visible"` (default) allows vertical expansion.
 */
test("overflowX hidden - only horizontal clipping, vertical can grow", () => {
  const output = renderToString(
    <Box width={5} overflowX="hidden" flexDirection="column">
      <Box width={10} flexShrink={0}>
        <Text>ABCDEFGHIJ{"\n"}1234567890</Text>
      </Box>
    </Box>,
  );

  const lines = output.split("\n").filter((line) => line.length > 0);

  // Width should be clipped to 5
  for (const line of lines) {
    expect(
      line.length <= 5,
      `Expected width <= 5, got ${line.length} for line "${line}"`,
    ).toBeTrue();
  }

  // Height should NOT be clipped - both lines should be visible
  expect(
    lines.length,
    `Expected 2 lines (no height clipping), got ${lines.length}`,
  ).toBe(2);
});

/**
 * Verifies that `overflowY="hidden"` clips vertically but allows horizontal
 * content to expand (or be visible if parent aligns).
 */
test("overflowY hidden - only vertical clipping, horizontal can grow", () => {
  const output = renderToString(
    <Box height={1} overflowY="hidden">
      <Box flexShrink={0}>
        <Text>ABCDEFGHIJ{"\n"}1234567890</Text>
      </Box>
    </Box>,
  );

  const lines = output.split("\n").filter((line) => line.length > 0);

  // Height should be clipped to 1
  expect(
    lines.length,
    `Expected 1 line (height clipped), got ${lines.length}`,
  ).toBe(1);

  // Width should NOT be clipped - full 10 characters should be visible
  expect(
    lines[0]?.length,
    `Expected width of 10 (no clipping), got ${lines[0]?.length}`,
  ).toBe(10);
});

// ============================================================================
// Test Group 8: Verify that overflow hidden is passed to Taffy layout engine
// ============================================================================

/**
 * Verifies that `overflow="hidden"` strictly maintains a box's dimensions
 * regardless of content, preserving layout for subsequent elements.
 * "NEXT" should be positioned immediately after the 5-wide box.
 */
test("overflow hidden box maintains exact specified dimensions", () => {
  // This test specifically checks that the layout engine respects overflow: hidden
  // by not expanding the parent to fit child content
  const output = renderToString(
    <Box flexDirection="row">
      <Box width={5} height={3} overflow="hidden" borderStyle="single">
        <Box width={100} height={100} flexShrink={0}>
          <Text>This is very long text that should be clipped</Text>
        </Box>
      </Box>
      <Box width={5}>
        <Text>NEXT</Text>
      </Box>
    </Box>,
  );

  const lines = output.split("\n");

  // The first box should be exactly 5 chars wide
  // The second box "NEXT" should start at position 5
  // If overflow isn't working, the first box might expand and push "NEXT" further right

  // Find the line containing "NEXT"
  const lineWithNext = lines.find((line) => line.includes("NEXT"));
  expect(lineWithNext, "Should find line containing NEXT").toBeTruthy();

  // NEXT should appear starting around position 5 (after the 5-wide overflow box)
  const nextPosition = lineWithNext?.indexOf("NEXT") ?? -1;
  expect(
    nextPosition >= 5 && nextPosition <= 6,
    `NEXT should be at position 5-6, but found at ${nextPosition}. Output:\n${output}`,
  ).toBeTrue();
});

// ============================================================================
// Test Group 9: Edge cases
// ============================================================================

/**
 * Edge case: ensure 0-width content doesn't crash layout with overflow hidden.
 */
test("overflow hidden with zero-width child", () => {
  renderToString(
    <Box width={10} overflow="hidden">
      <Box width={0}>
        <Text />
      </Box>
    </Box>,
  );

  // Should render an empty output or just whitespace
  expect().pass("Should not crash with zero-width child");
});

/**
 * Edge case: ensure content shifted by negative margin is clipped correctly.
 */
test("overflow hidden with negative margin child", () => {
  const output = renderToString(
    <Box width={10} overflow="hidden">
      <Box marginLeft={-5} width={20} flexShrink={0}>
        <Text>ABCDEFGHIJKLMNOPQRST</Text>
      </Box>
    </Box>,
  );

  // Content should be clipped at the box boundaries
  const line = output.split("\n").find((line) => line.length > 0);
  expect(
    (line?.length ?? 0) <= 10,
    `Expected width <= 10, got ${line?.length}`,
  ).toBeTrue();
});

/**
 * Verifies that `overflow="hidden"` works with percentage dimensions.
 */
test("overflow hidden should work with percentage dimensions", () => {
  const output = renderToString(
    <Box width={20} overflow="hidden">
      <Box width="50%" overflow="hidden">
        <Box width={30} flexShrink={0}>
          <Text>ABCDEFGHIJKLMNOPQRSTUVWXYZ1234</Text>
        </Box>
      </Box>
    </Box>,
  );

  // Inner box should be 50% of 20 = 10 chars, with overflow hidden
  const line = output.split("\n").find((line) => line.length > 0);
  expect(
    (line?.length ?? 0) <= 10,
    `Expected width <= 10 (50% of 20), got ${line?.length}. Output: "${line}"`,
  ).toBeTrue();
});

// ============================================================================
// Test Group 10: "min-width: auto" behavior (overflow: hidden allowing shrinking)
// ============================================================================

/**
 * Verifies that setting `overflow="hidden"` allows flex items to shrink below
 * their content size (unlike `visible`, which often enforces `min-content`).
 */
test("overflow hidden allows flex item to shrink below content size", () => {
  // In Flexbox, default min-width is 'auto', which means 'min-content'.
  // Setting overflow: hidden (or scroll/auto) changes default min-width to 0.
  // This means a flex item with overflow: hidden should be able to shrink to
  // fit its container, whereas one with overflow: visible should force
  // expansion (or overflow).

  const output = renderToString(
    <Box width={10} borderStyle="round">
      <Box overflow="hidden" flexGrow={1}>
        <Box width={20} flexShrink={0}>
          <Text>Content</Text>
        </Box>
      </Box>
    </Box>,
  );

  // Outer box is 10 wide.
  // Inner Box wants to be 20.
  // With overflow="hidden", Inner Box should shrink to fit inside Outer Box (width ~8).

  const lines = output.split("\n");
  // Check the width of the top border line. It should be 10 characters wide.
  // ╭────────╮ (10 chars, 8 content)

  expect(
    lines[0]?.length,
    `Top border should be 10 chars wide. Output:\n${output}`,
  ).toBe(10);
});

/**
 * Control test: `overflow="visible"` on a flex item prevents it from shrinking
 * below content size (standard flexbox behavior).
 */
test("overflow visible prevents flex item from shrinking below content size (control)", () => {
  // This is testing Tinky/Taffy default behavior.
  const output = renderToString(
    <Box width={10} borderStyle="round">
      <Box overflow="visible" flexGrow={1}>
        <Box width={20} flexShrink={0}>
          <Text>Content</Text>
        </Box>
      </Box>
    </Box>,
  );

  const lines = output.split("\n");
  expect(
    lines[0]?.length,
    "Parent with fixed width should remain fixed width",
  ).toBe(10);
});

// ============================================================================
// Test Group 11: Child dimensions verification inside overflow="hidden"
// ============================================================================

/**
 * Verifies that a rigid child (`flexShrink=0`) inside `overflow="hidden"`
 * retains its full width (is clipped, not shrunk).
 */
test("child inside overflow hidden retains its full size if not flexible", () => {
  // Child has fixed width 20, flexShrink 0.
  // Parent has width 10, overflow hidden.
  // Child should remain 20 wide. Text length 20 should NOT wrap.
  // If Child was forced to 10, text would wrap.

  const output = renderToString(
    <Box width={10} overflow="hidden">
      <Box width={20} flexShrink={0}>
        <Text>12345678901234567890</Text>
      </Box>
    </Box>,
  );

  // Output should show first 10 chars.
  // We check that there is only 1 line. If child became width 10, text would wrap to 2 lines.

  const lines = output.split("\n").filter((l) => l.length > 0);
  expect(
    lines.length,
    "Text should not wrap, implying child width is preserved at 20",
  ).toBe(1);
  expect(lines[0], "Should see clipped content of the first line").toBe(
    "1234567890",
  );
});

/**
 * Verifies that a flexible child (`flexShrink=1`) inside `overflow="hidden"`
 * shrinks to fit.
 */
test("child inside overflow hidden shrinks if flexible", () => {
  // Child has width 20, but flexShrink 1 (default is 1 in Tinky/Yoga/Taffy
  // generally, let's correspond to previous tests).
  // Actually Tinky Box default flexShrink is 1.
  // Parent width 10, overflow hidden.
  // Child should shrink to 10. Text length 20 SHOULD wrap.

  const output = renderToString(
    <Box width={10} overflow="hidden">
      <Box width={20} flexShrink={1}>
        <Text>12345678901234567890</Text>
      </Box>
    </Box>,
  );

  const lines = output.split("\n").filter((l) => l.length > 0);
  // Should wrap because child shrunk to 10.
  expect(
    lines.length,
    "Text SHOULD wrap, implying child width shrunk to 10",
  ).toBe(2);
  expect(lines[0], "Line 1").toBe("1234567890");
  expect(lines[1], "Line 2").toBe("1234567890");
});
