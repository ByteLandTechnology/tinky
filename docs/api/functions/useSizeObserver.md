[**tinky**](../README.md)

---

[tinky](../globals.md) / useSizeObserver

# Function: useSizeObserver()

> **useSizeObserver**(`options?`): \[(`node`) => `void`, `number`, `number`\]

Hook that observes the computed layout dimensions of a `<Box>` element
and triggers a re-render whenever its size changes.

The observer is registered in a global resize observer registry that is
invoked by the Tinky core after each layout computation pass. This means
size changes are detected regardless of which component caused the
re-render — including sibling updates and terminal resize events.

Multiple observers can be attached to the same element.

This is similar to HTML's `SizeObserver` API.

## Parameters

### options?

[`SizeObserverOptions`](../interfaces/SizeObserverOptions.md) = `{}`

Configuration options.

## Returns

\[(`node`) => `void`, `number`, `number`\]

A tuple containing `[refCallback, width, height]`. Attach `refCallback` to a `<Box>` element.

## Example

```tsx
import { Box, Text, useSizeObserver } from "tinky";

function MyComponent() {
  const [ref, width, height] = useSizeObserver();

  return (
    <Box ref={ref} width="50%" height={10}>
      <Text>
        Size: {width}x{height}
      </Text>
    </Box>
  );
}
```
