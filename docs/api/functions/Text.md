[**tinky**](../README.md)

---

[tinky](../globals.md) / Text

# Function: Text()

> **Text**(`__namedParameters`): `Element` \| `null`

This component can display text and change its style to make it bold,
underlined, italic, or strikethrough.

## Parameters

### \_\_namedParameters

[`TextProps`](../interfaces/TextProps.md)

## Returns

`Element` \| `null`

## Examples

```tsx
import { render, Text } from "tinky";

render(<Text color="green">I am green</Text>);
```

```tsx
import { render, Text } from "tinky";

render(
  <Text bold backgroundColor="blue">
    I am bold on blue background
  </Text>,
);
```
