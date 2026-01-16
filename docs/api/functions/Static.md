[**tinky**](../README.md)

---

[tinky](../globals.md) / Static

# Function: Static()

> **Static**\<`T`\>(`props`): `Element`

`<Static>` component permanently renders its output above everything else.
It's useful for displaying activity like completed tasks or logs—things that
don't change after they're rendered (hence the name "Static").

It's preferred to use `<Static>` for use cases when you can't know or control
the number of items that need to be rendered.

## Type Parameters

### T

`T`

## Parameters

### props

[`StaticProps`](../interfaces/StaticProps.md)\<`T`\>

## Returns

`Element`

## Example

```tsx
import { render, Static, Text } from "tinky";

const items = ["Item 1", "Item 2", "Item 3"];

render(
  <Static items={items}>
    {(item, index) => (
      <Text key={index} color="green">
        {item}
      </Text>
    )}
  </Static>,
);
```
