[**tinky**](../README.md)

---

[tinky](../globals.md) / Newline

# Function: Newline()

> **Newline**(`__namedParameters`): `Element`

Adds one or more newline (`\n`) characters. Must be used within `<Text>`
components.

## Parameters

### \_\_namedParameters

[`NewlineProps`](../interfaces/NewlineProps.md)

## Returns

`Element`

## Example

```tsx
import { render, Text, Newline } from "tinky";

render(
  <Text>
    Hello
    <Newline />
    World
  </Text>,
);
```
