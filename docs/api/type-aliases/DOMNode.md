[**tinky**](../README.md)

---

[tinky](../globals.md) / DOMNode

# Type Alias: DOMNode\<T\>

> **DOMNode**\<`T`\> = `T` _extends_ `object` ? `U` _extends_ `"#text"` ? [`TextNode`](TextNode.md) : [`DOMElement`](DOMElement.md) : `never`

Union type representing either a DOM element or a text node.

## Type Parameters

### T

`T` = \{ `nodeName`: [`NodeNames`](NodeNames.md); \}
