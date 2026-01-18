[**tinky**](../README.md)

---

[tinky](../globals.md) / TextStyles

# Interface: TextStyles

Common text styling props used by components like Text and Separator.

## Extended by

- [`TextProps`](TextProps.md)
- [`SeparatorProps`](SeparatorProps.md)

## Properties

### backgroundColor?

> `readonly` `optional` **backgroundColor**: `LiteralUnion`\<[`ForegroundColorName`](../type-aliases/ForegroundColorName.md), `string`\>

Same as `color`, but for the background.

---

### bold?

> `readonly` `optional` **bold**: `boolean`

Make the text bold.

---

### color?

> `readonly` `optional` **color**: `LiteralUnion`\<[`ForegroundColorName`](../type-aliases/ForegroundColorName.md), `string`\>

Change text color. Tinky uses Ansis under the hood, so all its functionality
is supported.

---

### dimColor?

> `readonly` `optional` **dimColor**: `boolean`

Dim the color (make it less bright).

---

### inverse?

> `readonly` `optional` **inverse**: `boolean`

Inverse background and foreground colors.

---

### italic?

> `readonly` `optional` **italic**: `boolean`

Make the text italic.

---

### strikethrough?

> `readonly` `optional` **strikethrough**: `boolean`

Make the text crossed out with a line.

---

### underline?

> `readonly` `optional` **underline**: `boolean`

Make the text underlined.
