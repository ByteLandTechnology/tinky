[**tinky**](../README.md)

---

[tinky](../globals.md) / TransformProps

# Interface: TransformProps

Props for the Transform component.

## Properties

### accessibilityLabel?

> `readonly` `optional` **accessibilityLabel**: `string`

Screen-reader-specific text to output. If set, all children will be
ignored.

---

### children?

> `readonly` `optional` **children**: `ReactNode`

Children to transform.

---

### transform()

> `readonly` **transform**: (`children`, `index`) => `string`

Function that transforms children output. It accepts children and must
return transformed children as well.

#### Parameters

##### children

`string`

##### index

`number`

#### Returns

`string`
