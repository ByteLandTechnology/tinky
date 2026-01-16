[**tinky**](../README.md)

---

[tinky](../globals.md) / StaticProps

# Interface: StaticProps\<T\>

Props for the Static component.

## Type Parameters

### T

`T`

## Properties

### children()

> `readonly` **children**: (`item`, `index`) => `ReactNode`

Function called to render each item in `items`. First arg is the item,
second is its index. Note that a `key` must be assigned to the root
component.

#### Parameters

##### item

`T`

##### index

`number`

#### Returns

`ReactNode`

---

### items

> `readonly` **items**: `T`[]

Array of items of any type to render using the function you pass as a
child.

---

### style?

> `readonly` `optional` **style**: [`Styles`](Styles.md)

Styles to apply to a container of child elements. See <Box> for properties.
