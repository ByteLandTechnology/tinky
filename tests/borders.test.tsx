import { test, expect } from "bun:test";
import boxen from "boxen";

import { boxStyles } from "../src/core/box-styles.js";
import ansis from "ansis";
import { render, Box, Text } from "../src/index.js";
import { renderToString } from "./helpers/render-to-string.js";
import { createStdout } from "./helpers/create-stdout.js";

/**
 * Verifies that a `<Box>` with `borderStyle="round"` renders a full-width
 * border by default.
 */
test("single node - full width box", () => {
  const output = renderToString(
    <Box borderStyle="round">
      <Text>Hello World</Text>
    </Box>,
  );

  expect(output).toBe(
    boxen("Hello World", { width: 100, borderStyle: "round" }),
  );
});

/**
 * Verifies that a `<Box>` correctly renders a colorful border when
 * `borderColor` is specified.
 */
test("single node - full width box with colorful border", () => {
  const output = renderToString(
    <Box borderStyle="round" borderColor="green">
      <Text>Hello World</Text>
    </Box>,
  );

  expect(output).toBe(
    boxen("Hello World", {
      width: 100,
      borderStyle: "round",
      borderColor: "green",
    }),
  );
});

/**
 * Verifies that a `<Box>` shrinks to fit its content when
 * `alignSelf="flex-start"` is used (or other non-stretch alignment).
 */
test("single node - fit-content box", () => {
  const output = renderToString(
    <Box borderStyle="round" alignSelf="flex-start">
      <Text>Hello World</Text>
    </Box>,
  );

  expect(output).toBe(boxen("Hello World", { borderStyle: "round" }));
});

/**
 * Verifies that borders wrap correctly around wide characters (e.g., Japanese).
 */
test("single node - fit-content box with wide characters", () => {
  const output = renderToString(
    <Box borderStyle="round" alignSelf="flex-start">
      <Text>こんにちは</Text>
    </Box>,
  );

  expect(output).toBe(boxen("こんにちは", { borderStyle: "round" }));
});

/**
 * Verifies that borders wrap correctly around emojis.
 */
test("single node - fit-content box with emojis", () => {
  const output = renderToString(
    <Box borderStyle="round" alignSelf="flex-start">
      <Text>🌊🌊</Text>
    </Box>,
  );

  expect(output).toBe(boxen("🌊🌊", { borderStyle: "round" }));
});

/**
 * Verifies that a `<Box>` renders a border with a fixed width when `width` is
 * specified.
 */
test("single node - fixed width box", () => {
  const output = renderToString(
    <Box borderStyle="round" width={20}>
      <Text>Hello World</Text>
    </Box>,
  );

  expect(output).toBe(
    boxen("Hello World".padEnd(18, " "), { borderStyle: "round" }),
  );
});

/**
 * Verifies that a `<Box>` renders a border with fixed width and height.
 */
test("single node - fixed width and height box", () => {
  const output = renderToString(
    <Box borderStyle="round" width={20} height={20}>
      <Text>Hello World</Text>
    </Box>,
  );

  expect(output).toBe(
    boxen("Hello World".padEnd(18, " ") + "\n".repeat(17), {
      borderStyle: "round",
    }),
  );
});

/**
 * Verifies that padding is correctly applied inside the border.
 */
test("single node - box with padding", () => {
  const output = renderToString(
    <Box borderStyle="round" padding={1} alignSelf="flex-start">
      <Text>Hello World</Text>
    </Box>,
  );

  expect(output).toBe(boxen("\n Hello World \n", { borderStyle: "round" }));
});

/**
 * Verifies that horizontal alignment (`justifyContent`) works correctly within
 * a bordered box.
 */
test("single node - box with horizontal alignment", () => {
  const output = renderToString(
    <Box borderStyle="round" width={20} justifyContent="center">
      <Text>Hello World</Text>
    </Box>,
  );

  expect(output).toBe(boxen("    Hello World   ", { borderStyle: "round" }));
});

/**
 * Verifies that vertical alignment (`alignItems`) works correctly within a
 * bordered box.
 */
test("single node - box with vertical alignment", () => {
  const output = renderToString(
    <Box
      borderStyle="round"
      height={20}
      alignItems="center"
      alignSelf="flex-start"
    >
      <Text>Hello World</Text>
    </Box>,
  );

  expect(output).toBe(
    boxen("\n".repeat(9) + "Hello World" + "\n".repeat(8), {
      borderStyle: "round",
    }),
  );
});

/**
 * Verifies text wrapping within a fixed-width bordered box.
 */
test("single node - box with wrapping", () => {
  const output = renderToString(
    <Box borderStyle="round" width={10}>
      <Text>Hello World</Text>
    </Box>,
  );

  expect(output).toBe(boxen("Hello   \nWorld", { borderStyle: "round" }));
});

/**
 * Verifies that full-width borders work correctly with multiple text nodes.
 */
test("multiple nodes - full width box", () => {
  const output = renderToString(
    <Box borderStyle="round">
      <Text>{"Hello "}World</Text>
    </Box>,
  );

  expect(output).toBe(
    boxen("Hello World", { width: 100, borderStyle: "round" }),
  );
});

/**
 * Verifies that a full-width box with multiple children renders a colorful
 * border correctly.
 */
test("multiple nodes - full width box with colorful border", () => {
  const output = renderToString(
    <Box borderStyle="round" borderColor="green">
      <Text>{"Hello "}World</Text>
    </Box>,
  );

  expect(output).toBe(
    boxen("Hello World", {
      width: 100,
      borderStyle: "round",
      borderColor: "green",
    }),
  );
});

/**
 * Verifies that a box with multiple children and `alignSelf="flex-start"`
 * shrinks to fit its content.
 */
test("multiple nodes - fit-content box", () => {
  const output = renderToString(
    <Box borderStyle="round" alignSelf="flex-start">
      <Text>{"Hello "}World</Text>
    </Box>,
  );

  expect(output).toBe(boxen("Hello World", { borderStyle: "round" }));
});

/**
 * Verifies that a box with multiple children renders with a fixed width when
 * specified.
 */
test("multiple nodes - fixed width box", () => {
  const output = renderToString(
    <Box borderStyle="round" width={20}>
      <Text>{"Hello "}World</Text>
    </Box>,
  );
  expect(output).toBe(
    boxen("Hello World".padEnd(18, " "), { borderStyle: "round" }),
  );
});

/**
 * Verifies that a box with multiple children renders with fixed width and
 * height.
 */
test("multiple nodes - fixed width and height box", () => {
  const output = renderToString(
    <Box borderStyle="round" width={20} height={20}>
      <Text>{"Hello "}World</Text>
    </Box>,
  );
  expect(output).toBe(
    boxen("Hello World".padEnd(18, " ") + "\n".repeat(17), {
      borderStyle: "round",
    }),
  );
});

/**
 * Verifies that padding is correctly applied to a box with multiple children.
 */
test("multiple nodes - box with padding", () => {
  const output = renderToString(
    <Box borderStyle="round" padding={1} alignSelf="flex-start">
      <Text>{"Hello "}World</Text>
    </Box>,
  );

  expect(output).toBe(boxen("\n Hello World \n", { borderStyle: "round" }));
});

/**
 * Verifies that horizontal alignment (`justifyContent="center"`) works
 * correctly with multiple children in a bordered box.
 */
test("multiple nodes - box with horizontal alignment", () => {
  const output = renderToString(
    <Box borderStyle="round" width={20} justifyContent="center">
      <Text>{"Hello "}World</Text>
    </Box>,
  );

  expect(output).toBe(boxen("    Hello World   ", { borderStyle: "round" }));
});

/**
 * Verifies that vertical alignment (`alignItems="center"`) works correctly with
 * multiple children in a bordered box.
 */
test("multiple nodes - box with vertical alignment", () => {
  const output = renderToString(
    <Box
      borderStyle="round"
      height={20}
      alignItems="center"
      alignSelf="flex-start"
    >
      <Text>{"Hello "}World</Text>
    </Box>,
  );

  expect(output).toBe(
    boxen("\n".repeat(9) + "Hello World" + "\n".repeat(8), {
      borderStyle: "round",
    }),
  );
});

/**
 * Verifies that text wrapping works correctly with multiple text nodes in a
 * bordered box.
 */
test("multiple nodes - box with wrapping", () => {
  const output = renderToString(
    <Box borderStyle="round" width={10}>
      <Text>{"Hello "}World</Text>
    </Box>,
  );

  expect(output).toBe(boxen("Hello   \nWorld", { borderStyle: "round" }));
});

/**
 * Verifies that text wrapping works correctly when the first text node is long.
 */
test("multiple nodes - box with wrapping and long first node", () => {
  const output = renderToString(
    <Box borderStyle="round" width={10}>
      <Text>{"Helloooooo"} World</Text>
    </Box>,
  );

  expect(output).toBe(boxen("Helloooo\noo World", { borderStyle: "round" }));
});

/**
 * Verifies that text wrapping works correctly when the first text node is
 * significantly longer than the box width.
 */
test("multiple nodes - box with wrapping and very long first node", () => {
  const output = renderToString(
    <Box borderStyle="round" width={10}>
      <Text>{"Hellooooooooooooo"} World</Text>
    </Box>,
  );

  expect(output).toBe(
    boxen("Helloooo\noooooooo\no World", { borderStyle: "round" }),
  );
});

/**
 * Verifies that nested bordered boxes render correctly, with the inner box
 * indented appropriately inside the outer box.
 */
test("nested boxes", () => {
  const output = renderToString(
    <Box borderStyle="round" width={40} padding={1}>
      <Box borderStyle="round" justifyContent="center" padding={1}>
        <Text>Hello World</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe(
    `╭──────────────────────────────────────╮
│                                      │
│ ╭─────────────╮                      │
│ │             │                      │
│ │ Hello World │                      │
│ │             │                      │
│ ╰─────────────╯                      │
│                                      │
╰──────────────────────────────────────╯`,
  );
});

/**
 * Verifies that nested boxes containing wide characters (e.g., Japanese) layout
 * correctly in a row.
 */
test("nested boxes - fit-content box with wide characters on flex-direction row", () => {
  const output = renderToString(
    <Box borderStyle="round" alignSelf="flex-start">
      <Box borderStyle="round">
        <Text>ミスター</Text>
      </Box>
      <Box borderStyle="round">
        <Text>スポック</Text>
      </Box>
      <Box borderStyle="round">
        <Text>カーク船長</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe(
    `╭────────────────────────────────╮
│╭────────╮╭────────╮╭──────────╮│
││ミスター││スポック││カーク船長││
│╰────────╯╰────────╯╰──────────╯│
╰────────────────────────────────╯`,
  );
});

/**
 * Verifies that nested boxes containing emojis layout correctly in a row.
 */
test("nested boxes - fit-content box with emojis on flex-direction row", () => {
  const output = renderToString(
    <Box borderStyle="round" alignSelf="flex-start">
      <Box borderStyle="round">
        <Text>🦾</Text>
      </Box>
      <Box borderStyle="round">
        <Text>🌏</Text>
      </Box>
      <Box borderStyle="round">
        <Text>😋</Text>
      </Box>
    </Box>,
  );

  const box1 = boxen("🦾", { borderStyle: "round" });
  const box2 = boxen("🌏", { borderStyle: "round" });
  const box3 = boxen("😋", { borderStyle: "round" });

  const expected = boxen(
    box1
      .split("\n")
      .map(
        (line, index) =>
          line + box2.split("\n")[index] + box3.split("\n")[index],
      )
      .join("\n"),
    { borderStyle: "round" },
  );

  expect(output).toBe(expected);
});

/**
 * Verifies that nested boxes containing wide characters (e.g., Japanese) layout
 * correctly in a column.
 */
test("nested boxes - fit-content box with wide characters on flex-direction column", () => {
  const output = renderToString(
    <Box borderStyle="round" alignSelf="flex-start" flexDirection="column">
      <Box borderStyle="round">
        <Text>ミスター</Text>
      </Box>
      <Box borderStyle="round">
        <Text>スポック</Text>
      </Box>
      <Box borderStyle="round">
        <Text>カーク船長</Text>
      </Box>
    </Box>,
  );

  const expected = boxen(
    boxen("ミスター  ", { borderStyle: "round" }) +
      "\n" +
      boxen("スポック  ", { borderStyle: "round" }) +
      "\n" +
      boxen("カーク船長", { borderStyle: "round" }),
    { borderStyle: "round" },
  );

  expect(output).toBe(expected);
});

/**
 * Verifies that nested boxes containing emojis layout correctly in a column.
 */
test("nested boxes - fit-content box with emojis on flex-direction column", () => {
  const output = renderToString(
    <Box borderStyle="round" alignSelf="flex-start" flexDirection="column">
      <Box borderStyle="round">
        <Text>🦾</Text>
      </Box>
      <Box borderStyle="round">
        <Text>🌏</Text>
      </Box>
      <Box borderStyle="round">
        <Text>😋</Text>
      </Box>
    </Box>,
  );

  const expected = boxen(
    boxen("🦾", { borderStyle: "round" }) +
      "\n" +
      boxen("🌏", { borderStyle: "round" }) +
      "\n" +
      boxen("😋", { borderStyle: "round" }),
    { borderStyle: "round" },
  );

  expect(output).toBe(expected);
});

/**
 * Verifies that the border updates correctly when the `borderColor` prop
 * changes during a re-render.
 */
test("render border after update", () => {
  const stdout = createStdout();

  function Test({ borderColor }: { readonly borderColor?: string }) {
    return (
      <Box borderStyle="round" borderColor={borderColor}>
        <Text>Hello World</Text>
      </Box>
    );
  }

  const { rerender } = render(<Test />, {
    stdout,
    debug: true,
  });

  expect(stdout.get()).toBe(
    boxen("Hello World", { width: 100, borderStyle: "round" }),
  );

  rerender(<Test borderColor="green" />);

  expect(stdout.get()).toBe(
    boxen("Hello World", {
      width: 100,
      borderStyle: "round",
      borderColor: "green",
    }),
  );

  rerender(<Test />);

  expect(stdout.get()).toBe(
    boxen("Hello World", {
      width: 100,
      borderStyle: "round",
    }),
  );
});

/**
 * Verifies that the top border can be hidden using `borderTop={false}`.
 */
test("hide top border", () => {
  const output = renderToString(
    <Box flexDirection="column" alignItems="flex-start">
      <Text>Above</Text>
      <Box borderStyle="round" borderTop={false}>
        <Text>Content</Text>
      </Box>
      <Text>Below</Text>
    </Box>,
  );

  expect(output).toBe(
    [
      "Above",
      `${boxStyles.round.left}Content${boxStyles.round.right}`,
      `${boxStyles.round.bottomLeft}${boxStyles.round.bottom.repeat(7)}${
        boxStyles.round.bottomRight
      }`,
      "Below",
    ].join("\n"),
  );
});

/**
 * Verifies that the bottom border can be hidden using `borderBottom={false}`.
 */
test("hide bottom border", () => {
  const output = renderToString(
    <Box flexDirection="column" alignItems="flex-start">
      <Text>Above</Text>
      <Box borderStyle="round" borderBottom={false}>
        <Text>Content</Text>
      </Box>
      <Text>Below</Text>
    </Box>,
  );

  expect(output).toBe(
    [
      "Above",
      `${boxStyles.round.topLeft}${boxStyles.round.top.repeat(7)}${
        boxStyles.round.topRight
      }`,
      `${boxStyles.round.left}Content${boxStyles.round.right}`,
      "Below",
    ].join("\n"),
  );
});

/**
 * Verifies that both top and bottom borders can be hidden simultaneously.
 */
test("hide top and bottom borders", () => {
  const output = renderToString(
    <Box flexDirection="column" alignItems="flex-start">
      <Text>Above</Text>
      <Box borderStyle="round" borderTop={false} borderBottom={false}>
        <Text>Content</Text>
      </Box>
      <Text>Below</Text>
    </Box>,
  );

  expect(output).toBe(
    [
      "Above",
      `${boxStyles.round.left}Content${boxStyles.round.right}`,
      "Below",
    ].join("\n"),
  );
});

/**
 * Verifies that the left border can be hidden using `borderLeft={false}`.
 */
test("hide left border", () => {
  const output = renderToString(
    <Box flexDirection="column" alignItems="flex-start">
      <Text>Above</Text>
      <Box borderStyle="round" borderLeft={false}>
        <Text>Content</Text>
      </Box>
      <Text>Below</Text>
    </Box>,
  );

  expect(output).toBe(
    [
      "Above",
      `${boxStyles.round.top.repeat(7)}${boxStyles.round.topRight}`,
      `Content${boxStyles.round.right}`,
      `${boxStyles.round.bottom.repeat(7)}${boxStyles.round.bottomRight}`,
      "Below",
    ].join("\n"),
  );
});

/**
 * Verifies that the right border can be hidden using `borderRight={false}`.
 */
test("hide right border", () => {
  const output = renderToString(
    <Box flexDirection="column" alignItems="flex-start">
      <Text>Above</Text>
      <Box borderStyle="round" borderRight={false}>
        <Text>Content</Text>
      </Box>
      <Text>Below</Text>
    </Box>,
  );

  expect(output).toBe(
    [
      "Above",
      `${boxStyles.round.topLeft}${boxStyles.round.top.repeat(7)}`,
      `${boxStyles.round.left}Content`,
      `${boxStyles.round.bottomLeft}${boxStyles.round.bottom.repeat(7)}`,
      "Below",
    ].join("\n"),
  );
});

/**
 * Verifies that both left and right borders can be hidden simultaneously.
 */
test("hide left and right border", () => {
  const output = renderToString(
    <Box flexDirection="column" alignItems="flex-start">
      <Text>Above</Text>
      <Box borderStyle="round" borderLeft={false} borderRight={false}>
        <Text>Content</Text>
      </Box>
      <Text>Below</Text>
    </Box>,
  );

  expect(output).toBe(
    [
      "Above",
      boxStyles.round.top.repeat(7),
      "Content",
      boxStyles.round.bottom.repeat(7),
      "Below",
    ].join("\n"),
  );
});

/**
 * Verifies that all borders can be hidden explicitly using `border*={false}`.
 */
test("hide all borders", () => {
  const output = renderToString(
    <Box flexDirection="column" alignItems="flex-start">
      <Text>Above</Text>
      <Box
        borderStyle="round"
        borderTop={false}
        borderBottom={false}
        borderLeft={false}
        borderRight={false}
      >
        <Text>Content</Text>
      </Box>
      <Text>Below</Text>
    </Box>,
  );

  expect(output).toBe(["Above", "Content", "Below"].join("\n"));
});

/**
 * Verifies that the top border color can be customized independently.
 */
test("change color of top border", () => {
  const output = renderToString(
    <Box flexDirection="column" alignItems="flex-start">
      <Text>Above</Text>
      <Box borderStyle="round" borderTopColor="green">
        <Text>Content</Text>
      </Box>
      <Text>Below</Text>
    </Box>,
  );

  expect(output).toBe(
    [
      "Above",
      ansis.green(
        `${boxStyles.round.topLeft}${boxStyles.round.top.repeat(7)}${
          boxStyles.round.topRight
        }`,
      ),
      `${boxStyles.round.left}Content${boxStyles.round.right}`,
      `${boxStyles.round.bottomLeft}${boxStyles.round.bottom.repeat(7)}${
        boxStyles.round.bottomRight
      }`,
      "Below",
    ].join("\n"),
  );
});

/**
 * Verifies that the bottom border color can be customized independently.
 */
test("change color of bottom border", () => {
  const output = renderToString(
    <Box flexDirection="column" alignItems="flex-start">
      <Text>Above</Text>
      <Box borderStyle="round" borderBottomColor="green">
        <Text>Content</Text>
      </Box>
      <Text>Below</Text>
    </Box>,
  );

  expect(output).toBe(
    [
      "Above",
      `${boxStyles.round.topLeft}${boxStyles.round.top.repeat(7)}${
        boxStyles.round.topRight
      }`,
      `${boxStyles.round.left}Content${boxStyles.round.right}`,
      ansis.green(
        `${boxStyles.round.bottomLeft}${boxStyles.round.bottom.repeat(7)}${
          boxStyles.round.bottomRight
        }`,
      ),
      "Below",
    ].join("\n"),
  );
});

/**
 * Verifies that the left border color can be customized independently.
 */
test("change color of left border", () => {
  const output = renderToString(
    <Box flexDirection="column" alignItems="flex-start">
      <Text>Above</Text>
      <Box borderStyle="round" borderLeftColor="green">
        <Text>Content</Text>
      </Box>
      <Text>Below</Text>
    </Box>,
  );

  expect(output).toBe(
    [
      "Above",
      `${boxStyles.round.topLeft}${boxStyles.round.top.repeat(7)}${
        boxStyles.round.topRight
      }`,
      `${ansis.green(boxStyles.round.left)}Content${boxStyles.round.right}`,
      `${boxStyles.round.bottomLeft}${boxStyles.round.bottom.repeat(7)}${
        boxStyles.round.bottomRight
      }`,
      "Below",
    ].join("\n"),
  );
});

/**
 * Verifies that the right border color can be customized independently.
 */
test("change color of right border", () => {
  const output = renderToString(
    <Box flexDirection="column" alignItems="flex-start">
      <Text>Above</Text>
      <Box borderStyle="round" borderRightColor="green">
        <Text>Content</Text>
      </Box>
      <Text>Below</Text>
    </Box>,
  );

  expect(output).toBe(
    [
      "Above",
      `${boxStyles.round.topLeft}${boxStyles.round.top.repeat(7)}${
        boxStyles.round.topRight
      }`,
      `${boxStyles.round.left}Content${ansis.green(boxStyles.round.right)}`,
      `${boxStyles.round.bottomLeft}${boxStyles.round.bottom.repeat(7)}${
        boxStyles.round.bottomRight
      }`,
      "Below",
    ].join("\n"),
  );
});

/**
 * Verifies that a custom border style (object with characters) can be applied.
 */
test("custom border style", () => {
  const output = renderToString(
    <Box
      borderStyle={{
        topLeft: "↘",
        top: "↓",
        topRight: "↙",
        left: "→",
        bottomLeft: "↗",
        bottom: "↑",
        bottomRight: "↖",
        right: "←",
      }}
    >
      <Text>Content</Text>
    </Box>,
  );

  expect(output).toBe(boxen("Content", { width: 100, borderStyle: "arrow" }));
});

/**
 * Verifies that the border can be dimmed using `borderDimColor`.
 */
test("dim border color", () => {
  const output = renderToString(
    <Box borderDimColor borderStyle="round">
      <Text>Content</Text>
    </Box>,
  );

  expect(output).toBe(
    boxen("Content", {
      width: 100,
      borderStyle: "round",
      dimBorder: true,
    }),
  );
});

/**
 * Verifies that the top border can be dimmed independently using
 * `borderTopDimColor`.
 */
test("dim top border color", () => {
  const output = renderToString(
    <Box flexDirection="column" alignItems="flex-start">
      <Text>Above</Text>
      <Box borderTopDimColor borderStyle="round">
        <Text>Content</Text>
      </Box>
      <Text>Below</Text>
    </Box>,
  );

  expect(output).toBe(
    [
      "Above",
      ansis.dim(
        `${boxStyles.round.topLeft}${boxStyles.round.top.repeat(7)}${
          boxStyles.round.topRight
        }`,
      ),
      `${boxStyles.round.left}Content${boxStyles.round.right}`,
      `${boxStyles.round.bottomLeft}${boxStyles.round.bottom.repeat(7)}${
        boxStyles.round.bottomRight
      }`,
      "Below",
    ].join("\n"),
  );
});

/**
 * Verifies that the bottom border can be dimmed independently using
 * `borderBottomDimColor`.
 */
test("dim bottom border color", () => {
  const output = renderToString(
    <Box flexDirection="column" alignItems="flex-start">
      <Text>Above</Text>
      <Box borderBottomDimColor borderStyle="round">
        <Text>Content</Text>
      </Box>
      <Text>Below</Text>
    </Box>,
  );

  expect(output).toBe(
    [
      "Above",
      `${boxStyles.round.topLeft}${boxStyles.round.top.repeat(7)}${
        boxStyles.round.topRight
      }`,
      `${boxStyles.round.left}Content${boxStyles.round.right}`,
      ansis.dim(
        `${boxStyles.round.bottomLeft}${boxStyles.round.bottom.repeat(7)}${
          boxStyles.round.bottomRight
        }`,
      ),
      "Below",
    ].join("\n"),
  );
});

/**
 * Verifies that the left border can be dimmed independently using
 * `borderLeftDimColor`.
 */
test("dim left border color", () => {
  const output = renderToString(
    <Box flexDirection="column" alignItems="flex-start">
      <Text>Above</Text>
      <Box borderLeftDimColor borderStyle="round">
        <Text>Content</Text>
      </Box>
      <Text>Below</Text>
    </Box>,
  );

  expect(output).toBe(
    [
      "Above",
      `${boxStyles.round.topLeft}${boxStyles.round.top.repeat(7)}${
        boxStyles.round.topRight
      }`,
      `${ansis.dim(boxStyles.round.left)}Content${boxStyles.round.right}`,
      `${boxStyles.round.bottomLeft}${boxStyles.round.bottom.repeat(7)}${
        boxStyles.round.bottomRight
      }`,
      "Below",
    ].join("\n"),
  );
});

/**
 * Verifies that the right border can be dimmed independently using
 * `borderRightDimColor`.
 */
test("dim right border color", () => {
  const output = renderToString(
    <Box flexDirection="column" alignItems="flex-start">
      <Text>Above</Text>
      <Box borderRightDimColor borderStyle="round">
        <Text>Content</Text>
      </Box>
      <Text>Below</Text>
    </Box>,
  );

  expect(output).toBe(
    [
      "Above",
      `${boxStyles.round.topLeft}${boxStyles.round.top.repeat(7)}${
        boxStyles.round.topRight
      }`,
      `${boxStyles.round.left}Content${ansis.dim(boxStyles.round.right)}`,
      `${boxStyles.round.bottomLeft}${boxStyles.round.bottom.repeat(7)}${
        boxStyles.round.bottomRight
      }`,
      "Below",
    ].join("\n"),
  );
});
