[**tinky**](../README.md)

---

[tinky](../globals.md) / render

# Function: render()

> **render**(`node`, `options?`): [`Instance`](../interfaces/Instance.md)

Mount a component and render the output.

## Parameters

### node

`ReactNode`

The React component to render.

### options?

[`RenderOptions`](../interfaces/RenderOptions.md)

Render options or the stdout stream.

## Returns

[`Instance`](../interfaces/Instance.md)

The Tinky instance.

## Examples

```tsx
import { render, Text } from "tinky";

render(<Text>Hello World</Text>);
```

```tsx
import { render, Text } from "tinky";

const { unmount } = render(<Text>Hello World</Text>);

setTimeout(() => {
  unmount();
}, 1000);
```
