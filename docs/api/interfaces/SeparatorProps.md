[**tinky**](../README.md)

---

[tinky](../globals.md) / SeparatorProps

# Interface: SeparatorProps

Props for the Separator component.

## Extends

- [`TextStyles`](TextStyles.md)

## Properties

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

### char?

> `readonly` `optional` **char**: `string`

The character to repeat for the separator line.

#### Default Value

```ts
"─";
```

#### Example

```tsx
<Separator char="=" />
```

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

### direction?

> `readonly` `optional` **direction**: `"horizontal"` \| `"vertical"`

The direction of the separator.

- `"horizontal"`: The separator will expand horizontally to fill the container's width. Height will be 1 row.
- `"vertical"`: The separator will expand vertically to fill the container's height. Width will be 1 column.

#### Default Value

```ts
"horizontal";
```

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
