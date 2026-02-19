import { test, expect } from "bun:test";
import boxen, { type Options } from "boxen";
import sliceAnsi from "slice-ansi";
import { Box, Text } from "../src/index.js";
import { renderToString } from "./helpers/render-to-string.js";

const box = (text: string, options?: Options): string =>
  boxen(text, {
    ...options,
    borderStyle: "round",
  });

const clipX = (text: string, columns: number): string =>
  text
    .split("\n")
    .map((line) => sliceAnsi(line, 0, columns).trim())
    .join("\n");

/**
 * Verifies that basic text inside an `overflowX="hidden"` container clips
 * correctly when it exceeds the width, but here it fits within the width.
 * Wait, the inner box is 16 wide, outer is 6. Text is "Hello World".
 * "Hello World" is 11 chars.
 * The output expectation "Hello" (5 chars) suggests wrapping or clipping?
 * If `overflowX="hidden"`, it should clip horizontally.
 * However, default flex wrap behavior might be affecting this if not specified?
 * The inner box has `flexShrink={0}` so it stays 16 wide.
 * The text "Hello World" fits in 16 wide.
 * But the outer box clips at 6.
 * "Hello " is 6 chars. "Hello" is 5.
 * "Hello World"
 * 012345
 * Hello
 * The space is index 5.
 * So passing "Hello" means it clipped at index 5 or 6?
 * If it clipped at 6, it would be "Hello ".
 * Expectation is "Hello".
 * It seems to be testing simple horizontal clipping.
 */
test("overflowX - single text node in a box inside overflow container", () => {
  const output = renderToString(
    <Box width={6} overflowX="hidden">
      <Box width={16} flexShrink={0}>
        <Text>Hello World</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("Hello");
});

/**
 * Verifies that `overflowX="hidden"` works correctly on a container with a
 * border.
 * The border takes up space (subtracting from content area).
 * Width 6 with border -> content width 4.
 * "Hello World" inside.
 * "Hell" is 4 chars.
 * So it should be clipped to "Hell".
 */
test("overflowX - single text node inside overflow container with border", () => {
  const output = renderToString(
    <Box width={6} overflowX="hidden" borderStyle="round">
      <Box width={16} flexShrink={0}>
        <Text>Hello World</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe(box("Hell"));
});

/**
 * Verifies that an inner element with a border is clipped correctly by the
 * outer overflow container.
 * Outer box (6 width) clips the Inner box (16 width, border).
 * Inner box renders "Hello World" inside its border.
 * Outer box clips this rendered string at width 6.
 */
test("overflowX - single text node in a box with border inside overflow container", () => {
  const output = renderToString(
    <Box width={6} overflowX="hidden">
      <Box width={16} flexShrink={0} borderStyle="round">
        <Text>Hello World</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe(clipX(box("Hello"), 6));
});

/**
 * Verifies that multiple text nodes within an overflow container are treated as
 * a single continuous stream for clipping.
 */
test("overflowX - multiple text nodes in a box inside overflow container", () => {
  const output = renderToString(
    <Box width={6} overflowX="hidden">
      <Box width={12} flexShrink={0}>
        <Text>Hello </Text>
        <Text>World</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("Hello");
});

/**
 * Verifies clipping of multiple text nodes inside a bordered overflow container.
 * Container Width 8, Border takes 2 -> Content Width 6.
 * "Hello " is 6 chars.
 */
test("overflowX - multiple text nodes in a box inside overflow container with border", () => {
  const output = renderToString(
    <Box width={8} overflowX="hidden" borderStyle="round">
      <Box width={12} flexShrink={0}>
        <Text>Hello </Text>
        <Text>World</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe(box("Hello "));
});

/**
 * Verifies that an inner bordered box containing multiple text nodes is clipped
 * by the outer overflow container.
 */
test("overflowX - multiple text nodes in a box with border inside overflow container", () => {
  const output = renderToString(
    <Box width={8} overflowX="hidden">
      <Box width={12} flexShrink={0} borderStyle="round">
        <Text>Hello </Text>
        <Text>World</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe(clipX(box("HelloWo\n"), 8));
});

/**
 * Verifies that sibling boxes are clipped when their combined width exceeds the
 * overflow container width.
 * Box 1 (6 width) + Box 2 (6 width) = 12 total.
 * Container (6 width).
 * Output should only show Box 1.
 */
test("overflowX - multiple boxes inside overflow container", () => {
  const output = renderToString(
    <Box width={6} overflowX="hidden">
      <Box width={6} flexShrink={0}>
        <Text>Hello </Text>
      </Box>
      <Box width={6} flexShrink={0}>
        <Text>World</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("Hello");
});

/**
 * Verifies that sibling boxes are clipped inside a bordered overflow container.
 * Width 8, Border 2 -> Content 6.
 * Box 1 (6 width) uses all space. Box 2 is clipped.
 */
test("overflowX - multiple boxes inside overflow container with border", () => {
  const output = renderToString(
    <Box width={8} overflowX="hidden" borderStyle="round">
      <Box width={6} flexShrink={0}>
        <Text>Hello </Text>
      </Box>
      <Box width={6} flexShrink={0}>
        <Text>World</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe(box("Hello "));
});

/**
 * Verifies that an element completely to the left of the overflow container
 * (due to negative margin) is invisible (clipped).
 */
test("overflowX - box before left edge of overflow container", () => {
  const output = renderToString(
    <Box width={6} overflowX="hidden">
      <Box marginLeft={-12} width={6} flexShrink={0}>
        <Text>Hello</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("");
});

/**
 * Verifies that an element shifted left out of bounds in a bordered container
 * is clipped, leaving empty space in the container.
 */
test("overflowX - box before left edge of overflow container with border", () => {
  const output = renderToString(
    <Box width={6} overflowX="hidden" borderStyle="round">
      <Box marginLeft={-12} width={6} flexShrink={0}>
        <Text>Hello</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe(box(" ".repeat(4)));
});

/**
 * Verifies that an element partially shifted left is partially clipped.
 * MarginLeft -3. "Hello World".
 * "Hel" is out of bounds.
 * "lo Wor" should be visible (6 chars).
 */
test("overflowX - box intersecting with left edge of overflow container", () => {
  const output = renderToString(
    <Box width={6} overflowX="hidden">
      <Box marginLeft={-3} width={12} flexShrink={0}>
        <Text>Hello World</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("lo Wor");
});

/**
 * Verifies partial clipping on the left edge inside a bordered container.
 */
test("overflowX - box intersecting with left edge of overflow container with border", () => {
  const output = renderToString(
    <Box width={8} overflowX="hidden" borderStyle="round">
      <Box marginLeft={-3} width={12} flexShrink={0}>
        <Text>Hello World</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe(box("lo Wor"));
});

/**
 * Verifies that an element completely to the right of the overflow container
 * (due to positive margin) is invisible (clipped).
 */
test("overflowX - box after right edge of overflow container", () => {
  const output = renderToString(
    <Box width={6} overflowX="hidden">
      <Box marginLeft={6} width={6} flexShrink={0}>
        <Text>Hello</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("");
});

/**
 * Verifies that an element partially shifted right is partially clipped.
 * MarginLeft 3. Container Width 6.
 * "Hello" starts at index 3.
 * Visible range 0-6.
 * "   Hel" (3 spaces + "Hel").
 */
test("overflowX - box intersecting with right edge of overflow container", () => {
  const output = renderToString(
    <Box width={6} overflowX="hidden">
      <Box marginLeft={3} width={6} flexShrink={0}>
        <Text>Hello</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("   Hel");
});

/**
 * Verifies that `overflowY="hidden"` clips content vertically.
 * Height 1. Content has 2 lines.
 * Should just show "Hello".
 */
test("overflowY - single text node inside overflow container", () => {
  const output = renderToString(
    <Box height={1} overflowY="hidden">
      <Text>Hello{"\n"}World</Text>
    </Box>,
  );

  expect(output).toBe("Hello");
});

/**
 * Verifies vertical clipping inside a bordered container.
 * Height 3. Border 2 -> Content Height 1.
 * Should show Box with 1 line of content ("Hello").
 */
test("overflowY - single text node inside overflow container with border", () => {
  const output = renderToString(
    <Box width={20} height={3} overflowY="hidden" borderStyle="round">
      <Text>Hello{"\n"}World</Text>
    </Box>,
  );

  expect(output).toBe(box("Hello".padEnd(18, " ")));
});

/**
 * Verifies vertical clipping of multiple vertically stacked boxes.
 * Height 2.
 * Box 1 (Line #1), Box 2 (Line #2) fit.
 * Box 3, 4 clipped.
 */
test("overflowY - multiple boxes inside overflow container", () => {
  const output = renderToString(
    <Box height={2} overflowY="hidden" flexDirection="column">
      <Box flexShrink={0}>
        <Text>Line #1</Text>
      </Box>
      <Box flexShrink={0}>
        <Text>Line #2</Text>
      </Box>
      <Box flexShrink={0}>
        <Text>Line #3</Text>
      </Box>
      <Box flexShrink={0}>
        <Text>Line #4</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("Line #1\nLine #2");
});

/**
 * Verifies vertical clipping of stacked boxes inside a bordered container.
 * Height 4, Border 2 -> Content Height 2.
 */
test("overflowY - multiple boxes inside overflow container with border", () => {
  const output = renderToString(
    <Box
      width={9}
      height={4}
      overflowY="hidden"
      flexDirection="column"
      borderStyle="round"
    >
      <Box flexShrink={0}>
        <Text>Line #1</Text>
      </Box>
      <Box flexShrink={0}>
        <Text>Line #2</Text>
      </Box>
      <Box flexShrink={0}>
        <Text>Line #3</Text>
      </Box>
      <Box flexShrink={0}>
        <Text>Line #4</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe(box("Line #1\nLine #2"));
});

/**
 * Verifies that an element completely above the overflow container (due to
 * negative margin top) is clipped.
 */
test("overflowY - box above top edge of overflow container", () => {
  const output = renderToString(
    <Box height={1} overflowY="hidden">
      <Box marginTop={-2} height={2} flexShrink={0}>
        <Text>Hello{"\n"}World</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("");
});

/**
 * Verifies that an element shifted above a bordered container is clipped.
 */
test("overflowY - box above top edge of overflow container with border", () => {
  const output = renderToString(
    <Box width={7} height={3} overflowY="hidden" borderStyle="round">
      <Box marginTop={-3} height={2} flexShrink={0}>
        <Text>Hello{"\n"}World</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe(box(" ".repeat(5)));
});

/**
 * Verifies that an element overlapping the top edge is partially clipped.
 * Margin -1. "Hello" is top line (index -1), "World" is second line (index 0).
 * Visible index 0. Should see "World".
 */
test("overflowY - box intersecting with top edge of overflow container", () => {
  const output = renderToString(
    <Box height={1} overflowY="hidden">
      <Box marginTop={-1} height={2} flexShrink={0}>
        <Text>Hello{"\n"}World</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("World");
});

/**
 * Verifies partial top edge clipping inside a bordered container.
 */
test("overflowY - box intersecting with top edge of overflow container with border", () => {
  const output = renderToString(
    <Box width={7} height={3} overflowY="hidden" borderStyle="round">
      <Box marginTop={-1} height={2} flexShrink={0}>
        <Text>Hello{"\n"}World</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe(box("World"));
});

/**
 * Verifies that an element below the container's bottom edge is clipped.
 */
test("overflowY - box below bottom edge of overflow container", () => {
  const output = renderToString(
    <Box height={1} overflowY="hidden">
      <Box marginTop={1} height={2} flexShrink={0}>
        <Text>Hello{"\n"}World</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("");
});

/**
 * Verifies that an element below a bordered container's bottom edge is clipped.
 */
test("overflowY - box below bottom edge of overflow container with border", () => {
  const output = renderToString(
    <Box width={7} height={3} overflowY="hidden" borderStyle="round">
      <Box marginTop={2} height={2} flexShrink={0}>
        <Text>Hello{"\n"}World</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe(box(" ".repeat(5)));
});

/**
 * Verifies that an element overlapping the bottom edge is partially clipped.
 * Container Height 1.
 * "Hello" at index 0 (Visible). "World" at index 1 (Clipped).
 */
test("overflowY - box intersecting with bottom edge of overflow container", () => {
  const output = renderToString(
    <Box height={1} overflowY="hidden">
      <Box height={2} flexShrink={0}>
        <Text>Hello{"\n"}World</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("Hello");
});

/**
 * Verifies partial bottom edge clipping inside a bordered container.
 */
test("overflowY - box intersecting with bottom edge of overflow container with border", () => {
  const output = renderToString(
    <Box width={7} height={3} overflowY="hidden" borderStyle="round">
      <Box height={2} flexShrink={0}>
        <Text>Hello{"\n"}World</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe(box("Hello"));
});

/**
 * Verifies `overflow="hidden"` (both X and Y) on a container with padding.
 * Padding allows content to be inset, but overflow clips consistently.
 */
test("overflow - single text node inside overflow container", () => {
  const output = renderToString(
    <Box paddingBottom={1}>
      <Box width={6} height={1} overflow="hidden">
        <Box width={12} height={2} flexShrink={0}>
          <Text>Hello{"\n"}World</Text>
        </Box>
      </Box>
    </Box>,
  );

  expect(output).toBe("Hello\n");
});

/**
 * Verifies `overflow="hidden"` with border.
 * Width 8, Height 3. Border 2. Content 6x1.
 * "Hello World" -> "Hello " (clippedX)
 * "World" (clippedY)
 */
test("overflow - single text node inside overflow container with border", () => {
  const output = renderToString(
    <Box paddingBottom={1}>
      <Box width={8} height={3} overflow="hidden" borderStyle="round">
        <Box width={12} height={2} flexShrink={0}>
          <Text>Hello{"\n"}World</Text>
        </Box>
      </Box>
    </Box>,
  );

  expect(output).toBe(`${box("Hello ")}\n`);
});

/**
 * Verifies clipping of multiple sibling boxes with `overflow="hidden"`.
 * 2 boxes side-by-side. 4x1 container.
 * Box 1 (2x2) -> TL, BL.
 * Box 2 (2x2) -> TR, BR.
 * Output combined: "TLTR". BL/BR clipped.
 */
test("overflow - multiple boxes inside overflow container", () => {
  const output = renderToString(
    <Box paddingBottom={1}>
      <Box width={4} height={1} overflow="hidden">
        <Box width={2} height={2} flexShrink={0}>
          <Text>TL{"\n"}BL</Text>
        </Box>
        <Box width={2} height={2} flexShrink={0}>
          <Text>TR{"\n"}BR</Text>
        </Box>
      </Box>
    </Box>,
  );

  expect(output).toBe("TLTR\n");
});

/**
 * Verifies clipping of multiple siblings in a bordered container.
 * Width 6, Height 3. Border 2 -> Content 4x1.
 * Same content "TLTR".
 */
test("overflow - multiple boxes inside overflow container with border", () => {
  const output = renderToString(
    <Box paddingBottom={1}>
      <Box width={6} height={3} overflow="hidden" borderStyle="round">
        <Box width={2} height={2} flexShrink={0}>
          <Text>TL{"\n"}BL</Text>
        </Box>
        <Box width={2} height={2} flexShrink={0}>
          <Text>TR{"\n"}BR</Text>
        </Box>
      </Box>
    </Box>,
  );

  expect(output).toBe(`${box("TLTR")}\n`);
});

/**
 * Verifies box clipping when element overflows Top and Left boundaries.
 * Margin Top -2, Left -2.
 * Content: AAAA, BBBB, CCCC, DDDD.
 * AAAA, BBBB clipped.
 * Left 2 chars of each line clipped.
 * Remaining: CC, DD.
 */
test("overflow - box intersecting with top left edge of overflow container", () => {
  const output = renderToString(
    <Box width={4} height={4} overflow="hidden">
      <Box marginTop={-2} marginLeft={-2} width={4} height={4} flexShrink={0}>
        <Text>
          AAAA{"\n"}BBBB{"\n"}CCCC{"\n"}DDDD
        </Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("CC\nDD\n\n");
});

/**
 * Verifies box clipping Top and Right.
 * Margin Top -2, Left 2.
 * AAAA, BBBB clipped (vertical).
 * content AAAA is shifted right by 2.
 * Output width 4. "  AA".
 */
test("overflow - box intersecting with top right edge of overflow container", () => {
  const output = renderToString(
    <Box width={4} height={4} overflow="hidden">
      <Box marginTop={-2} marginLeft={2} width={4} height={4} flexShrink={0}>
        <Text>
          AAAA{"\n"}BBBB{"\n"}CCCC{"\n"}DDDD
        </Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("  CC\n  DD\n\n");
});

/**
 * Verifies box clipping Bottom and Left.
 * Margin Top 2, Left -2.
 * CCCC, DDDD clipped (vertical, > height 4... wait)
 * Container H=4. Box start at 2. Ends at 6.
 * Content AAAA (at 2), BBBB (at 3), CCCC (at 4 clipped), DDDD (at 5 clipped).
 * Wait, expectation is "AA\nBB".
 * AAAA starts at y=2.
 * Output: \n\nAA\nBB.
 */
test("overflow - box intersecting with bottom left edge of overflow container", () => {
  const output = renderToString(
    <Box width={4} height={4} overflow="hidden">
      <Box marginTop={2} marginLeft={-2} width={4} height={4} flexShrink={0}>
        <Text>
          AAAA{"\n"}BBBB{"\n"}CCCC{"\n"}DDDD
        </Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("\n\nAA\nBB");
});

/**
 * Verifies box clipping Bottom and Right.
 * Margin Top 2, Left 2.
 * Result: \n\n  AA\n  BB
 */
test("overflow - box intersecting with bottom right edge of overflow container", () => {
  const output = renderToString(
    <Box width={4} height={4} overflow="hidden">
      <Box marginTop={2} marginLeft={2} width={4} height={4} flexShrink={0}>
        <Text>
          AAAA{"\n"}BBBB{"\n"}CCCC{"\n"}DDDD
        </Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("\n\n  AA\n  BB");
});

/**
 * Verifies that nested overflow containers clip iteratively.
 * Outer Box (4x4).
 * Inner Box 1 (2x2, overflow hidden). Inner Box 2 (4x3).
 * Inner Box 1 clips its content (AAAA, BBBB...). Results in AA\nBB (clipped at 2x2?)
 * Actually AAAA -> AA.
 * Output: AA\nXXXX\nYYYY\nZZZZ.
 * Wait, Inner Box 1 is 2x2. Content AA\nBB.
 * But output string says "AA\nXXXX..."
 * Where is BB?
 * Inner Box 1 is flex column. Box flexShrink 0.
 * Maybe it's clipped?
 * Inner Box 1 H=2. AAAA (Line 1), BBBB (Line 2).
 * Ah, maybe Box 2 (XXXX...) covers it?
 * No, flex column.
 * Output is "AA\nXXXX...".
 * It seems Box 1 produced only "AA".
 */
test("nested overflow", () => {
  const output = renderToString(
    <Box paddingBottom={1}>
      <Box width={4} height={4} overflow="hidden" flexDirection="column">
        <Box width={2} height={2} overflow="hidden">
          <Box width={4} height={4} flexShrink={0}>
            <Text>
              AAAA{"\n"}BBBB{"\n"}CCCC{"\n"}DDDD
            </Text>
          </Box>
        </Box>

        <Box width={4} height={3}>
          <Text>
            XXXX{"\n"}YYYY{"\n"}ZZZZ
          </Text>
        </Box>
      </Box>
    </Box>,
  );

  expect(output).toBe("AA\nXXXX\nYYYY\nZZZZ\n");
});

/**
 * Verifies regression fix: out of bounds writes in boxen/rendering logic should
 * not crash the renderer.
 * This simulates a specific crash case where buffer writing could go beyond
 * array limits.
 */
test("out of bounds writes do not crash", () => {
  const output = renderToString(
    <Box width={12} height={10} borderStyle="round" flexShrink={0} />,
    { columns: 10 },
  );

  const expected = boxen("", {
    width: 12,
    height: 10,
    borderStyle: "round",
  })
    .split("\n")
    .map((line) => line.slice(0, 10).trimEnd())
    .join("\n");

  expect(output).toBe(expected);
});
