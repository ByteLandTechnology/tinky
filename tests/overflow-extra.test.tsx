import { test, expect } from "bun:test";
import { Box, Text } from "../src/index.js";
import { renderToString } from "./helpers/render-to-string.js";

// ============================================================================
// Test Group 1: Explicit Min/Max Constraints Interaction
// ============================================================================

/**
 * Verifies that `overflow="hidden"` allows content to shrink (if flexibles) but
 * explicit minWidth constraints on children are respected.
 * Even if the parent has `overflow="hidden"`, a child with `minWidth` larger
 * than parent should force clipping if it can't shrink further.
 */
test("overflow hidden with explicit minWidth > parent width", () => {
  // If explicit minWidth says 15, but parent says 10 with overflow hidden...
  // The child should refuse to shrink below 15, so it should overflow the 10 container (which is hidden).
  // The 10 container should remain 10.
  const output = renderToString(
    <Box width={10} overflow="hidden">
      <Box minWidth={15} flexShrink={1}>
        <Text>123456789012345</Text>
      </Box>
    </Box>,
  );

  const lines = output.split("\n").filter((l) => l.length > 0);
  expect(lines.length).toBe(1);
  expect(lines[0]?.length).toBe(10);
  expect(lines[0]).toBe("1234567890");
});

/**
 * Verifies that explicit `minHeight` on a child is respected even when parent
 * has `overflow="hidden"` and smaller height.
 * The child remains tall, and the parent clips it.
 */
test("overflow hidden with explicit minHeight > parent height", () => {
  const output = renderToString(
    <Box height={2} overflow="hidden" flexDirection="column">
      <Box minHeight={4} flexShrink={1}>
        <Text>
          L1{"\n"}L2{"\n"}L3{"\n"}L4
        </Text>
      </Box>
    </Box>,
  );

  const lines = output.split("\n").filter((l) => l.length > 0);
  expect(lines.length).toBe(2);
  expect(lines[0]).toBe("L1");
  expect(lines[1]).toBe("L2");
});

// ============================================================================
// Test Group 2: Flex Basis Interaction
// ============================================================================

/**
 * Verifies that `overflow="hidden"` allows flex items to shrink below their
 * `flexBasis` (or default auto width) if `flexShrink` acts.
 */
test("overflow hidden should shrink flex-basis", () => {
  // Parent width 10. Child flexBasis 20. flexShrink 1.
  // Since overflow is hidden (forcing min-width behavior to 0 logic), it should shrink to 10.
  const output = renderToString(
    <Box width={10} overflow="hidden">
      <Box flexBasis={20} flexShrink={1}>
        <Text>12345678901234567890</Text>
      </Box>
    </Box>,
  );

  const lines = output.split("\n").filter((l) => l.length > 0);
  // If it shrunk to 10, the text "12345678901234567890" (length 20) in a 10-width box should wrap?
  // Wait, Text wraps based on available width.
  // If the box became 10 wide, text wrapping logic kicks in.
  expect(lines.length).toBe(2);
  expect(lines[0]).toBe("1234567890");
});

/**
 * Verifies that if `flexShrink={0}`, `overflow="hidden"` on parent does NOT
 * shrink the child. The child stays big and gets clipped.
 */
test("overflow hidden should NOT shrink flex-basis if flexShrink=0", () => {
  const output = renderToString(
    <Box width={10} overflow="hidden">
      <Box flexBasis={20} flexShrink={0}>
        <Text>12345678901234567890</Text>
      </Box>
    </Box>,
  );

  const lines = output.split("\n").filter((l) => l.length > 0);
  // Box stays 20. Text fits in one line. Parent clips at 10.
  expect(lines.length).toBe(1);
  expect(lines[0]?.length).toBe(10);
});

// ============================================================================
// Test Group 3: Column Direction & Min Height
// ============================================================================

/**
 * Verifies that vertical overflow hidden restricts height to parent size.
 */
test("column direction: overflow hidden allows shrinking height below content", () => {
  // Parent height 3. Child content needs 5 lines.
  // flexGrow 1, flexShrink 1.
  const output = renderToString(
    <Box height={3} overflow="hidden" flexDirection="column">
      <Box flexGrow={1} flexShrink={1}>
        <Text>
          1{"\n"}2{"\n"}3{"\n"}4{"\n"}5
        </Text>
      </Box>
    </Box>,
  );

  const lines = output.split("\n").filter((l) => l.length > 0);
  expect(lines.length).toBe(3);
});

// ============================================================================
// Test Group 4: Deep Nesting Mixed Overflow
// ============================================================================

/**
 * Verifies correct clipping propagation through nested containers with mixed
 * overflow settings (hidden -> visible -> hidden).
 */
test("deep nesting mixed: hidden > visible > hidden", () => {
  // Grandparent: width 10, hidden
  // Parent: visible (should extend if needed? But constrained by grandparent?)
  // Child: width 20, flexShrink 0.
  //
  // Grandparent (10) -> Parent (Visible) -> Child (20)
  // Parent is visible, so it should be large enough to hold Child (20).
  // Grandparent is hidden, so it should clip Parent @ 10.

  const output = renderToString(
    <Box width={10} overflow="hidden">
      <Box overflow="visible">
        <Box width={20} flexShrink={0}>
          <Text>12345678901234567890</Text>
        </Box>
      </Box>
    </Box>,
  );

  const line = output.split("\n").find((l) => l.length > 0);
  expect(line?.length).toBe(10);
  expect(line).toBe("1234567890");
});

// ============================================================================
// Test Group 5: Text Wrapping inside Overflow Hidden + Padding
// ============================================================================

/**
 * Verifies that text wrapping calculation accounts for padding when inside an
 * overflow hidden container.
 */
test("text wrapping with padding and overflow hidden", () => {
  // Parent width 12. Padding 1. Available content width = 10.
  // Text "1234567890" (10 chars) should fit on one line.
  // Text "12345678901" (11 chars) should wrap.
  const output = renderToString(
    <Box width={12} padding={1} overflow="hidden">
      <Text>12345678901</Text>
    </Box>,
  );

  const lines = output.split("\n").filter((l) => l.trim().length > 0);
  // Top padding line
  // Content lines.
  // Bottom padding line.
  //
  // width 12. padding 1. content width 10.
  // "12345678901" -> "1234567890" + "1"

  // Check content lines
  // remove padding lines
  const contentLines = lines.filter((l) => l.includes("1"));
  expect(contentLines.length >= 2).toBeTrue();
});
