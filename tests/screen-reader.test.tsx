import { test, expect } from "bun:test";
import { Box, Text } from "../src/index.js";
import { renderToString } from "./helpers/render-to-string.js";

/**
 * Verifies that text content is rendered correctly for screen readers via
 * `aria-label`.
 *
 * An `aria-label` on a Box should override its children's content for screen
 * readers.
 */
test("render text for screen readers", () => {
  const output = renderToString(
    <Box aria-label="Hello World">
      <Text>Not visible to screen readers</Text>
    </Box>,
    {
      isScreenReaderEnabled: true,
    },
  );

  expect(output).toBe("Hello World");
});

/**
 * Verifies that content marked with `aria-hidden` is excluded from screen
 * reader output.
 */
test("render text for screen readers with aria-hidden", () => {
  const output = renderToString(
    <Box aria-hidden>
      <Text>Not visible to screen readers</Text>
    </Box>,
    {
      isScreenReaderEnabled: true,
    },
  );

  expect(output).toBe("");
});

/**
 * Verifies that `aria-role` is correctly prefixed to the content in screen
 * reader output.
 */
test("render text for screen readers with aria-role", () => {
  const output = renderToString(
    <Box aria-role="button">
      <Text>Click me</Text>
    </Box>,
    {
      isScreenReaderEnabled: true,
    },
  );

  expect(output).toBe("button: Click me");
});

/**
 * Verifies complex structure rendering for screen readers, including nested
 * lists and selection state.
 */
test("render select input for screen readers", () => {
  const items = ["Red", "Green", "Blue"];

  const output = renderToString(
    <Box aria-role="list" flexDirection="column">
      <Text>Select a color:</Text>
      {items.map((item, index) => {
        const isSelected = index === 1;
        const screenReaderLabel = `${index + 1}. ${item}`;

        return (
          <Box
            key={item}
            aria-label={screenReaderLabel}
            aria-role="listitem"
            aria-state={{ selected: isSelected }}
          >
            <Text>{item}</Text>
          </Box>
        );
      })}
    </Box>,
    {
      isScreenReaderEnabled: true,
    },
  );

  expect(output).toBe(
    "list: Select a color:\nlistitem: 1. Red\nlistitem: (selected) 2. Green\nlistitem: 3. Blue",
  );
});

/**
 * Verifies that `aria-label` works on `<Text>` components, acting as
 * screen-reader-only text.
 */
test("render aria-label only Text for screen readers", () => {
  const output = renderToString(<Text aria-label="Screen-reader only" />, {
    isScreenReaderEnabled: true,
  });

  expect(output).toBe("Screen-reader only");
});

/**
 * Verifies that `aria-label` works on empty `<Box>` components, providing
 * accessible text.
 */
test("render aria-label only Box for screen readers", () => {
  const output = renderToString(<Box aria-label="Screen-reader only" />, {
    isScreenReaderEnabled: true,
  });

  expect(output).toBe("Screen-reader only");
});

/**
 * Verifies that ANSI styling (colors, formatting) is stripped from screen
 * reader output.
 */
test("omit ANSI styling in screen-reader output", () => {
  const output = renderToString(
    <Box>
      {}
      <Text bold color="green" inverse underline>
        Styled content
      </Text>
    </Box>,
    {
      isScreenReaderEnabled: true,
    },
  );

  expect(output).toBe("Styled content");
});

/**
 * Verifies that elements with `display="none"` are correctly excluded from
 * screen reader output.
 */
test("skip nodes with display:none style in screen-reader output", () => {
  const output = renderToString(
    <Box>
      <Box display="none">
        <Text>Hidden</Text>
      </Box>
      <Text>Visible</Text>
    </Box>,
    { isScreenReaderEnabled: true },
  );

  expect(output).toBe("Visible");
});

/**
 * Verifies rendering of multiple sibling Text components in screen reader mode.
 */
test("render multiple Text components", () => {
  const output = renderToString(
    <Box flexDirection="column">
      <Text>Hello</Text>
      <Text>World</Text>
    </Box>,
    {
      isScreenReaderEnabled: true,
    },
  );

  expect(output).toBe("Hello\nWorld");
});

/**
 * Verifies that nested structures (Box containing Text) render correctly.
 */
test("render nested Box components with Text", () => {
  const output = renderToString(
    <Box flexDirection="column">
      <Text>Hello</Text>
      <Box>
        <Text>World</Text>
      </Box>
    </Box>,
    {
      isScreenReaderEnabled: true,
    },
  );

  expect(output).toBe("Hello\nWorld");
});

function NullComponent(): undefined {
  return undefined;
}

/**
 * Verifies that components returning `null` or `undefined` are ignored in the
 * output.
 */
test("render component that returns null", () => {
  const output = renderToString(
    <Box flexDirection="column">
      <Text>Hello</Text>
      <NullComponent />
      <Text>World</Text>
    </Box>,
    {
      isScreenReaderEnabled: true,
    },
  );

  expect(output).toBe("Hello\nWorld");
});

/**
 * Verifies that `aria-state={{ busy: true }}` adds a "(busy)" prefix.
 */
test("render with aria-state.busy", () => {
  const output = renderToString(
    <Box aria-state={{ busy: true }}>
      <Text>Loading</Text>
    </Box>,
    {
      isScreenReaderEnabled: true,
    },
  );

  expect(output).toBe("(busy) Loading");
});

/**
 * Verifies that `aria-state={{ checked: true }}` adds a "(checked)" prefix.
 */
test("render with aria-state.checked", () => {
  const output = renderToString(
    <Box aria-role="checkbox" aria-state={{ checked: true }}>
      <Text>Accept terms</Text>
    </Box>,
    {
      isScreenReaderEnabled: true,
    },
  );

  expect(output).toBe("checkbox: (checked) Accept terms");
});

/**
 * Verifies that `aria-state={{ disabled: true }}` adds a "(disabled)" prefix.
 */
test("render with aria-state.disabled", () => {
  const output = renderToString(
    <Box aria-role="button" aria-state={{ disabled: true }}>
      <Text>Submit</Text>
    </Box>,
    {
      isScreenReaderEnabled: true,
    },
  );

  expect(output).toBe("button: (disabled) Submit");
});

/**
 * Verifies that `aria-state={{ expanded: true }}` adds an "(expanded)" prefix.
 */
test("render with aria-state.expanded", () => {
  const output = renderToString(
    <Box aria-role="combobox" aria-state={{ expanded: true }}>
      <Text>Select</Text>
    </Box>,
    {
      isScreenReaderEnabled: true,
    },
  );

  expect(output).toBe("combobox: (expanded) Select");
});

/**
 * Verifies that `aria-state={{ multiline: true }}` adds a "(multiline)" prefix.
 */
test("render with aria-state.multiline", () => {
  const output = renderToString(
    <Box aria-role="textbox" aria-state={{ multiline: true }}>
      <Text>Hello</Text>
    </Box>,
    {
      isScreenReaderEnabled: true,
    },
  );

  expect(output).toBe("textbox: (multiline) Hello");
});

/**
 * Verifies that `aria-state={{ multiselectable: true }}` adds a "(multiselectable)" prefix.
 */
test("render with aria-state.multiselectable", () => {
  const output = renderToString(
    <Box aria-role="listbox" aria-state={{ multiselectable: true }}>
      <Text>Options</Text>
    </Box>,
    {
      isScreenReaderEnabled: true,
    },
  );

  expect(output).toBe("listbox: (multiselectable) Options");
});

/**
 * Verifies that `aria-state={{ readonly: true }}` adds a "(readonly)" prefix.
 */
test("render with aria-state.readonly", () => {
  const output = renderToString(
    <Box aria-role="textbox" aria-state={{ readonly: true }}>
      <Text>Hello</Text>
    </Box>,
    {
      isScreenReaderEnabled: true,
    },
  );

  expect(output).toBe("textbox: (readonly) Hello");
});

/**
 * Verifies that `aria-state={{ required: true }}` adds a "(required)" prefix.
 */
test("render with aria-state.required", () => {
  const output = renderToString(
    <Box aria-role="textbox" aria-state={{ required: true }}>
      <Text>Name</Text>
    </Box>,
    {
      isScreenReaderEnabled: true,
    },
  );

  expect(output).toBe("textbox: (required) Name");
});

/**
 * Verifies that `aria-state={{ selected: true }}` adds a "(selected)" prefix.
 */
test("render with aria-state.selected", () => {
  const output = renderToString(
    <Box aria-role="option" aria-state={{ selected: true }}>
      <Text>Blue</Text>
    </Box>,
    {
      isScreenReaderEnabled: true,
    },
  );

  expect(output).toBe("option: (selected) Blue");
});

/**
 * Verifies rendering of simple multi-line text blocks.
 */
test("render multi-line text", () => {
  const output = renderToString(
    <Box flexDirection="column">
      <Text>Line 1</Text>
      <Text>Line 2</Text>
    </Box>,
    {
      isScreenReaderEnabled: true,
    },
  );

  expect(output).toBe("Line 1\nLine 2");
});

/**
 * Verifies nested multi-line text rendering.
 */
test("render nested multi-line text", () => {
  const output = renderToString(
    <Box flexDirection="row">
      <Box flexDirection="column">
        <Text>Line 1</Text>
        <Text>Line 2</Text>
      </Box>
    </Box>,
    {
      isScreenReaderEnabled: true,
    },
  );

  expect(output).toBe("Line 1\nLine 2");
});

/**
 * Verifies rendering of a row of text (joined by spaces).
 */
test("render nested row", () => {
  const output = renderToString(
    <Box flexDirection="column">
      <Box flexDirection="row">
        <Text>Line 1</Text>
        <Text>Line 2</Text>
      </Box>
    </Box>,
    {
      isScreenReaderEnabled: true,
    },
  );

  expect(output).toBe("Line 1 Line 2");
});

/**
 * Verifies multi-line text with roles (e.g. lists).
 */
test("render multi-line text with roles", () => {
  const output = renderToString(
    <Box flexDirection="column" aria-role="list">
      <Box aria-role="listitem">
        <Text>Item 1</Text>
      </Box>
      <Box aria-role="listitem">
        <Text>Item 2</Text>
      </Box>
    </Box>,
    {
      isScreenReaderEnabled: true,
    },
  );

  expect(output).toBe("list: listitem: Item 1\nlistitem: Item 2");
});

/**
 * Verifies rendering of a listbox with multiple selectable options, ensuring
 * roles and states are correctly formatted.
 */
test("render listbox with multiselectable options", () => {
  const output = renderToString(
    <Box
      flexDirection="column"
      aria-role="listbox"
      aria-state={{ multiselectable: true }}
    >
      <Box aria-role="option" aria-state={{ selected: true }}>
        <Text>Option 1</Text>
      </Box>
      <Box aria-role="option" aria-state={{ selected: false }}>
        <Text>Option 2</Text>
      </Box>
      <Box aria-role="option" aria-state={{ selected: true }}>
        <Text>Option 3</Text>
      </Box>
    </Box>,
    {
      isScreenReaderEnabled: true,
    },
  );

  expect(output).toBe(
    "listbox: (multiselectable) option: (selected) Option 1\noption: Option 2\noption: (selected) Option 3",
  );
});
