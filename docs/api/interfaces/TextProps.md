[**tinky**](../README.md)

---

[tinky](../globals.md) / TextProps

# Interface: TextProps

Props for the Text component.

## Extends

- [`TextStyles`](TextStyles.md)

## Properties

### aria-hidden?

> `readonly` `optional` **aria-hidden**: `boolean`

Hide the element from screen readers.

---

### aria-label?

> `readonly` `optional` **aria-label**: `string`

A label for the element for screen readers.

---

### backgroundColor?

> `readonly` `optional` **backgroundColor**: `LiteralUnion`\<[`ForegroundColorName`](../type-aliases/ForegroundColorName.md), `string`\>

Same as `color`, but for the background.

#### Inherited from

[`TextStyles`](TextStyles.md).[`backgroundColor`](TextStyles.md#backgroundcolor)

---

### bold?

> `readonly` `optional` **bold**: `boolean`

Make the text bold.

#### Inherited from

[`TextStyles`](TextStyles.md).[`bold`](TextStyles.md#bold)

---

### children?

> `readonly` `optional` **children**: `ReactNode`

Children of the component.

---

### color?

> `readonly` `optional` **color**: `LiteralUnion`\<[`ForegroundColorName`](../type-aliases/ForegroundColorName.md), `string`\>

Change text color. Tinky uses Ansis under the hood, so all its functionality
is supported.

#### Inherited from

[`TextStyles`](TextStyles.md).[`color`](TextStyles.md#color)

---

### dimColor?

> `readonly` `optional` **dimColor**: `boolean`

Dim the color (make it less bright).

#### Inherited from

[`TextStyles`](TextStyles.md).[`dimColor`](TextStyles.md#dimcolor)

---

### inverse?

> `readonly` `optional` **inverse**: `boolean`

Inverse background and foreground colors.

#### Inherited from

[`TextStyles`](TextStyles.md).[`inverse`](TextStyles.md#inverse)

---

### italic?

> `readonly` `optional` **italic**: `boolean`

Make the text italic.

#### Inherited from

[`TextStyles`](TextStyles.md).[`italic`](TextStyles.md#italic)

---

### strikethrough?

> `readonly` `optional` **strikethrough**: `boolean`

Make the text crossed out with a line.

#### Inherited from

[`TextStyles`](TextStyles.md).[`strikethrough`](TextStyles.md#strikethrough)

---

### underline?

> `readonly` `optional` **underline**: `boolean`

Make the text underlined.

#### Inherited from

[`TextStyles`](TextStyles.md).[`underline`](TextStyles.md#underline)

---

### wrap?

> `readonly` `optional` **wrap**: `"end"` \| `"truncate"` \| `"middle"` \| `"wrap"` \| `"truncate-end"` \| `"truncate-middle"` \| `"truncate-start"`

This property tells Tinky to wrap or truncate text if its width is larger
than the container. If `wrap` is passed (the default), Tinky will wrap text
and split it into multiple lines. If `truncate-*` is passed, Tinky will
truncate text instead, resulting in one line with the rest cut off.
