[**tinky**](../README.md)

---

[tinky](../globals.md) / Spacer

# Function: Spacer()

> **Spacer**(): `Element`

A flexible space that expands along the major axis of its containing layout.

It's useful as a shortcut for filling all available space between elements.

## Returns

`Element`

## Example

```tsx
import { render, Box, Text, Spacer } from "tinky";

render(
  <Box>
    <Text>Left</Text>
    <Spacer />
    <Text>Right</Text>
  </Box>,
);
```
