[**tinky**](../README.md)

---

[tinky](../globals.md) / TextProps

# Interface: TextProps

Props for the Text component.

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

> `readonly` `optional` **backgroundColor**: `LiteralUnion`\<keyof ForegroundColor, `string`\>

Same as `color`, but for the background.

---

### bold?

> `readonly` `optional` **bold**: `boolean`

Make the text bold.

---

### children?

> `readonly` `optional` **children**: `ReactNode`

Children of the component.

---

### color?

> `readonly` `optional` **color**: `LiteralUnion`\<keyof ForegroundColor, `string`\>

Change text color. Tinky uses Chalk under the hood, so all its functionality
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

---

### wrap?

> `readonly` `optional` **wrap**: `"end"` \| `"truncate"` \| `"middle"` \| `"wrap"` \| `"truncate-end"` \| `"truncate-middle"` \| `"truncate-start"`

This property tells Tinky to wrap or truncate text if its width is larger
than the container. If `wrap` is passed (the default), Tinky will wrap text
and split it into multiple lines. If `truncate-*` is passed, Tinky will
truncate text instead, resulting in one line with the rest cut off.
