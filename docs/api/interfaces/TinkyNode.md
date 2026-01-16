[**tinky**](../README.md)

---

[tinky](../globals.md) / TinkyNode

# Interface: TinkyNode

Interface representing a node in the Tinky tree.

## Properties

### internal_static?

> `optional` **internal_static**: `boolean`

Whether this node is inside a Static component.

---

### parentNode

> **parentNode**: [`DOMElement`](../type-aliases/DOMElement.md) \| `undefined`

Parent DOM element in the tree.

---

### style

> **style**: [`Styles`](Styles.md)

Styles applied to this node.

---

### taffyNode?

> `optional` **taffyNode**: [`TaffyNode`](TaffyNode.md)

Taffy layout node for computing dimensions.
