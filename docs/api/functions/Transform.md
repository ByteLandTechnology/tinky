[**tinky**](../README.md)

---

[tinky](../globals.md) / Transform

# Function: Transform()

> **Transform**(`__namedParameters`): `Element` \| `null`

Transform a string representation of React components before they're written
to output. For example, you might want to apply a gradient to text, add a
clickable link, or create some text effects. These use cases can't accept
React nodes as input; they expect a string. That's what the <Transform>
component does: it gives you an output string of its child components and
lets you transform it in any way.

## Parameters

### \_\_namedParameters

[`TransformProps`](../interfaces/TransformProps.md)

## Returns

`Element` \| `null`

## Example

```tsx
import { render, Transform, Text } from "tinky";

render(
  <Transform transform={(output) => output.toUpperCase()}>
    <Text>Hello World</Text>
  </Transform>,
);
// Output: HELLO WORLD
```
