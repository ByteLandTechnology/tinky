[**tinky**](../README.md)

---

[tinky](../globals.md) / Box

# Variable: Box

> `const` **Box**: `ForwardRefExoticComponent`\<`object` & `object` & `object` & `RefAttributes`\<[`DOMElement`](../type-aliases/DOMElement.md)\>\>

`<Box>` is an essential Tinky component to build your layout. It's like
`<div style="display: flex">` in the browser.

## Examples

```tsx
import { render, Box, Text } from "tinky";

render(
  <Box margin={2}>
    <Text>This is a box with margin</Text>
  </Box>,
);
```

```tsx
import { render, Box, Text } from "tinky";

render(
  <Box flexDirection="column">
    <Text>Item 1</Text>
    <Text>Item 2</Text>
  </Box>,
);
```
