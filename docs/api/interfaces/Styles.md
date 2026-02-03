[**tinky**](../README.md)

---

[tinky](../globals.md) / Styles

# Interface: Styles

## Properties

### alignContent?

> `readonly` `optional` **alignContent**: `"center"` \| `"end"` \| `"start"` \| `"space-around"` \| `"space-between"` \| `"space-evenly"` \| `"stretch"` \| `"flex-end"` \| `"flex-start"`

Align content.
Modifies the behavior of `flexWrap`. It aligns flex lines much like
`alignItems` aligns flex items.

#### See

[align-content](https://css-tricks.com/almanac/properties/a/align-content/)

---

### alignItems?

> `readonly` `optional` **alignItems**: `"center"` \| `"end"` \| `"start"` \| `"stretch"` \| `"flex-end"` \| `"flex-start"`

Align items.
Defines the default behavior for how flex items are laid out along the
cross axis on the current line.

#### See

[align-items](https://css-tricks.com/almanac/properties/a/align-items/)

#### Example

```tsx
<Box alignItems="center">
  <Text>I am centered</Text>
</Box>
```

---

### alignSelf?

> `readonly` `optional` **alignSelf**: `"auto"` \| `"center"` \| `"end"` \| `"start"` \| `"flex-end"` \| `"flex-start"`

Align self.
Allows overriding the `alignItems` value for specific flex items.

#### See

[align-self](https://css-tricks.com/almanac/properties/a/align-self/)

---

### backgroundColor?

> `readonly` `optional` **backgroundColor**: `LiteralUnion`\<keyof ForegroundColor, `string`\>

Background color.
Accepts the same values as `color` in the `<Text>` component.

---

### borderBottom?

> `readonly` `optional` **borderBottom**: `boolean`

Bottom border visibility.

#### Default

```ts
true;
```

---

### borderBottomColor?

> `readonly` `optional` **borderBottomColor**: `LiteralUnion`\<keyof ForegroundColor, `string`\>

Bottom border color.

---

### borderBottomDimColor?

> `readonly` `optional` **borderBottomDimColor**: `boolean`

Dim bottom border color.

#### Default

```ts
false;
```

---

### borderColor?

> `readonly` `optional` **borderColor**: `LiteralUnion`\<keyof ForegroundColor, `string`\>

Border color.
Shorthand for setting `borderTopColor`, `borderRightColor`,
`borderBottomColor`, and `borderLeftColor`.

---

### borderDimColor?

> `readonly` `optional` **borderDimColor**: `boolean`

Dim border color.
Shorthand for setting `borderTopDimColor`, `borderBottomDimColor`,
`borderLeftDimColor`, and `borderRightDimColor`.

#### Default

```ts
false;
```

---

### borderLeft?

> `readonly` `optional` **borderLeft**: `boolean`

Left border visibility.

#### Default

```ts
true;
```

---

### borderLeftColor?

> `readonly` `optional` **borderLeftColor**: `LiteralUnion`\<keyof ForegroundColor, `string`\>

Left border color.

---

### borderLeftDimColor?

> `readonly` `optional` **borderLeftDimColor**: `boolean`

Dim left border color.

#### Default

```ts
false;
```

---

### borderRight?

> `readonly` `optional` **borderRight**: `boolean`

Right border visibility.

#### Default

```ts
true;
```

---

### borderRightColor?

> `readonly` `optional` **borderRightColor**: `LiteralUnion`\<keyof ForegroundColor, `string`\>

Right border color.

---

### borderRightDimColor?

> `readonly` `optional` **borderRightDimColor**: `boolean`

Dim right border color.

#### Default

```ts
false;
```

---

### borderStyle?

> `readonly` `optional` **borderStyle**: [`BoxStyle`](BoxStyle.md) \| keyof Boxes

Border style.
If `undefined` (default), no border is added.

#### Example

```tsx
<Box borderStyle="single">
  <Text>Hello World</Text>
</Box>
```

---

### borderTop?

> `readonly` `optional` **borderTop**: `boolean`

Top border visibility.

#### Default

```ts
true;
```

---

### borderTopColor?

> `readonly` `optional` **borderTopColor**: `LiteralUnion`\<keyof ForegroundColor, `string`\>

Top border color.

---

### borderTopDimColor?

> `readonly` `optional` **borderTopDimColor**: `boolean`

Dim top border color.

#### Default

```ts
false;
```

---

### columnGap?

> `readonly` `optional` **columnGap**: `number`

Size of the gap between an element's columns.

---

### display?

> `readonly` `optional` **display**: `"flex"` \| `"none"` \| `"grid"`

Display type of the element.

- `flex`: Displays the element as a flex container (default).
- `grid`: Displays the element as a grid container.
- `none`: Hides the element.

---

### flexBasis?

> `readonly` `optional` **flexBasis**: `string` \| `number`

Flex basis.
Specifies the initial size of the flex item before any available space
is distributed.

#### See

[flex-basis](https://css-tricks.com/almanac/properties/f/flex-basis/)

---

### flexDirection?

> `readonly` `optional` **flexDirection**: `"column"` \| `"column-reverse"` \| `"row"` \| `"row-reverse"`

Flex direction.
Establishes the main-axis, defining the direction flex items are placed
in the flex container.

#### See

[flex-direction](https://css-tricks.com/almanac/properties/f/flex-direction/)

#### Example

```tsx
<Box flexDirection="column">
  <Text>I am item 1</Text>
  <Text>I am item 2</Text>
</Box>
```

---

### flexGrow?

> `readonly` `optional` **flexGrow**: `number`

Flex grow factor.
Defines how much a flex item will grow relative to the rest of the flex
items when there is available vertical/horizontal space.

#### See

[flex-grow](https://css-tricks.com/almanac/properties/f/flex-grow/)

---

### flexShrink?

> `readonly` `optional` **flexShrink**: `number`

Flex shrink factor.
Defines how much a flex item will shrink relative to the rest of the flex
items when there is not enough space.

#### See

[flex-shrink](https://css-tricks.com/almanac/properties/f/flex-shrink/)

---

### flexWrap?

> `readonly` `optional` **flexWrap**: `"nowrap"` \| `"wrap"` \| `"wrap-reverse"`

Flex wrap behavior.
Defines whether flex items are forced onto one line or can wrap onto
multiple lines.

#### See

[flex-wrap](https://css-tricks.com/almanac/properties/f/flex-wrap/)

---

### gap?

> `readonly` `optional` **gap**: `number`

Size of the gap between an element's columns and rows.
This is a shorthand for `columnGap` and `rowGap`.

---

### gridAutoColumns?

> `readonly` `optional` **gridAutoColumns**: (`number` \| `TrackSizingFunction`)[]

Grid auto columns.
Specifies the size of an implicitly-created grid column track.

#### See

[grid-auto-columns](https://developer.mozilla.org/en-US/docs/Web/CSS/)

---

### gridAutoFlow?

> `readonly` `optional` **gridAutoFlow**: `"column"` \| `"row"` \| `"row-dense"` \| `"column-dense"`

Grid auto flow.
Controls how the auto-placement algorithm works.

#### See

[grid-auto-flow](https://developer.mozilla.org/en-US/docs/Web/CSS/)

---

### gridAutoRows?

> `readonly` `optional` **gridAutoRows**: (`number` \| `TrackSizingFunction`)[]

Grid auto rows.
Specifies the size of an implicitly-created grid row track.

#### See

[grid-auto-rows](https://developer.mozilla.org/en-US/docs/Web/CSS/)

---

### gridColumn?

> `readonly` `optional` **gridColumn**: `Line`\<`GridPlacement`\>

Grid column.
Specifies a grid item's size and location within a grid column.

#### See

[grid-column](https://developer.mozilla.org/en-US/docs/Web/CSS/)

---

### gridRow?

> `readonly` `optional` **gridRow**: `Line`\<`GridPlacement`\>

Grid row.
Specifies a grid item’s size and location within a grid row.

#### See

[grid-row](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row)

---

### gridTemplateAreas?

> `readonly` `optional` **gridTemplateAreas**: `GridTemplateArea`[]

Grid template areas.
Specifies named grid areas.

#### See

[grid-template-areas](https://developer.mozilla.org/en-US/docs/Web/CSS/)

---

### gridTemplateColumns?

> `readonly` `optional` **gridTemplateColumns**: (`number` \| `GridTemplateComponent`)[]

Grid template columns.
Defines the columns of the grid with a space-separated list of values.

#### See

[grid-template-columns](https://developer.mozilla.org/en-US/docs/Web/CSS/)

---

### gridTemplateRows?

> `readonly` `optional` **gridTemplateRows**: (`number` \| `GridTemplateComponent`)[]

Grid template rows.
Defines the rows of the grid with a space-separated list of values.

#### See

[grid-template-rows](https://developer.mozilla.org/en-US/docs/Web/CSS/)

---

### height?

> `readonly` `optional` **height**: `string` \| `number`

Height of the element.
Can be a number (in lines) or a percentage string (e.g., "50%").

---

### justifyContent?

> `readonly` `optional` **justifyContent**: `"center"` \| `"end"` \| `"start"` \| `"space-around"` \| `"space-between"` \| `"space-evenly"` \| `"flex-end"` \| `"flex-start"`

Justify content.
Defines the alignment along the main axis.

#### See

[justify-content](https://css-tricks.com/almanac/properties/j/justify-content/)

#### Example

```tsx
<Box justifyContent="space-between">
  <Text>Left</Text>
  <Text>Right</Text>
</Box>
```

---

### justifyItems?

> `readonly` `optional` **justifyItems**: `"center"` \| `"end"` \| `"stretch"` \| `"flex-end"` \| `"flex-start"`

Justify items.
Defines the default `justify-self` for all items of the box.

#### See

[justify-items](https://css-tricks.com/almanac/properties/j/justify-items/)

---

### justifySelf?

> `readonly` `optional` **justifySelf**: `"auto"` \| `"center"` \| `"end"` \| `"stretch"` \| `"flex-end"` \| `"flex-start"`

Justify self.
Sets the way a box is justified inside its alignment container along
the appropriate axis.

#### See

[justify-self](https://css-tricks.com/almanac/properties/j/justify-self/)

---

### margin?

> `readonly` `optional` **margin**: `number`

Margin on all sides.
Equivalent to setting `marginTop`, `marginBottom`, `marginLeft`,
and `marginRight`.

---

### marginBottom?

> `readonly` `optional` **marginBottom**: `number`

Bottom margin.

---

### marginLeft?

> `readonly` `optional` **marginLeft**: `number`

Left margin.

---

### marginRight?

> `readonly` `optional` **marginRight**: `number`

Right margin.

---

### marginTop?

> `readonly` `optional` **marginTop**: `number`

Top margin.

---

### marginX?

> `readonly` `optional` **marginX**: `number`

Horizontal margin.
Equivalent to setting `marginLeft` and `marginRight`.

---

### marginY?

> `readonly` `optional` **marginY**: `number`

Vertical margin.
Equivalent to setting `marginTop` and `marginBottom`.

---

### minHeight?

> `readonly` `optional` **minHeight**: `string` \| `number`

Minimum height of the element.

---

### minWidth?

> `readonly` `optional` **minWidth**: `string` \| `number`

Minimum width of the element.

---

### overflow?

> `readonly` `optional` **overflow**: `"hidden"` \| `"visible"`

Overflow behavior.
Sets the behavior for an element's overflow in both directions.

#### Default

```ts
"visible";
```

---

### overflowX?

> `readonly` `optional` **overflowX**: `"hidden"` \| `"visible"`

Horizontal overflow behavior.

#### Default

```ts
"visible";
```

---

### overflowY?

> `readonly` `optional` **overflowY**: `"hidden"` \| `"visible"`

Vertical overflow behavior.

#### Default

```ts
"visible";
```

---

### padding?

> `readonly` `optional` **padding**: `number`

Padding on all sides.
Equivalent to setting `paddingTop`, `paddingBottom`, `paddingLeft`,
and `paddingRight`.

---

### paddingBottom?

> `readonly` `optional` **paddingBottom**: `number`

Bottom padding.

---

### paddingLeft?

> `readonly` `optional` **paddingLeft**: `number`

Left padding.

---

### paddingRight?

> `readonly` `optional` **paddingRight**: `number`

Right padding.

---

### paddingTop?

> `readonly` `optional` **paddingTop**: `number`

Top padding.

---

### paddingX?

> `readonly` `optional` **paddingX**: `number`

Horizontal padding.
Equivalent to setting `paddingLeft` and `paddingRight`.

---

### paddingY?

> `readonly` `optional` **paddingY**: `number`

Vertical padding.
Equivalent to setting `paddingTop` and `paddingBottom`.

---

### position?

> `readonly` `optional` **position**: `"absolute"` \| `"relative"`

Positioning strategy.

- `absolute`: Positioned relative to the nearest positioned ancestor.
- `relative`: Positioned relative to normal position.

---

### rowGap?

> `readonly` `optional` **rowGap**: `number`

Size of the gap between an element's rows.

---

### textWrap?

> `readonly` `optional` **textWrap**: `"end"` \| `"truncate"` \| `"middle"` \| `"wrap"` \| `"truncate-end"` \| `"truncate-middle"` \| `"truncate-start"`

Text wrapping behavior.

- `wrap`: Text wraps to the next line.
- `end`: Truncates the end of the text.
- `middle`: Truncates the middle of the text.
- `truncate-end`: Truncates the end of the text.
- `truncate`: Truncates the end of the text.
- `truncate-middle`: Truncates the middle of the text.
- `truncate-start`: Truncates the beginning of the text.

---

### width?

> `readonly` `optional` **width**: `string` \| `number`

Width of the element.
Can be a number (in spaces) or a percentage string (e.g., "50%").
