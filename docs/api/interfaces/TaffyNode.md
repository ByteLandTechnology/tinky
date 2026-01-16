[**tinky**](../README.md)

---

[tinky](../globals.md) / TaffyNode

# Interface: TaffyNode

Represents a node in the Taffy layout tree.
This class wraps a Taffy node ID and manages its lifecycle.

## Properties

### id

> **id**: `bigint`

Unique identifier for the node within the Taffy tree.

---

### measureFunc()?

> `optional` **measureFunc**: (`width`) => `object`

Callback function to measure the content of the node.
Used for text nodes or other content with intrinsic size.

#### Parameters

##### width

`AvailableSpace`

Available width for content.

#### Returns

`object`

Element dimensions.

##### height

> **height**: `number`

##### width

> **width**: `number`

---

### tree

> **tree**: `TaffyTree`

The Taffy tree instance this node belongs to.

## Methods

### free()

> **free**(): `void`

Removes the node and all its descendants from the Taffy tree.
Necessary to prevent memory leaks as Taffy nodes aren't GC'd automatically.

#### Returns

`void`
