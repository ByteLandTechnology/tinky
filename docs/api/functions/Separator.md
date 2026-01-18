[**tinky**](../README.md)

---

[tinky](../globals.md) / Separator

# Function: Separator()

> **Separator**(`__namedParameters`): `Element`

A component that renders a line of repeated characters to fill the available space.

The `<Separator>` component is designed to be efficient and layout-friendly.
Unlike manually repeating a character in a generic text string, this component
uses the underlying layout engine (Taffy) to determine the exact number of
characters needed to fill the container. This prevents overflow issues and
avoids allocating unnecessarily large strings in memory.

It supports both horizontal and vertical orientations and accepts all standard
text styling properties (color, background, bold, etc.).

## Parameters

### \_\_namedParameters

[`SeparatorProps`](../interfaces/SeparatorProps.md)

## Returns

`Element`

## Examples

**Basic Usage**

Renders a horizontal line using the default character "─".

```tsx
import { render, Box, Separator } from "tinky";

render(
  <Box flexDirection="column" width={20}>
    <Text>Title</Text>
    <Separator />
    <Text>Content</Text>
  </Box>,
);
```

**Vertical Separator**

Renders a vertical line in a row layout.

```tsx
<Box height={5}>
  <Text>Left</Text>
  <Separator direction="vertical" char="│" />
  <Text>Right</Text>
</Box>
```

**Styling**

You can apply colors and text modifiers just like with the `<Text>` component.

```tsx
<Separator char="=" color="blue" bold backgroundColor="white" />
```
