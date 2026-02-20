[**tinky**](../README.md)

---

[tinky](../globals.md) / DOMElement

# Type Alias: DOMElement

> **DOMElement** = `object` & [`TinkyNode`](../interfaces/TinkyNode.md)

Interface representing a DOM element in Tinky.

## Type Declaration

### attributes

> **attributes**: `Record`\<`string`, [`DOMNodeAttribute`](DOMNodeAttribute.md)\>

Key-value pairs of element attributes.

### childNodes

> **childNodes**: [`DOMNode`](DOMNode.md)[]

Array of child nodes.

### internal_accessibility?

> `optional` **internal_accessibility**: `object`

Accessibility attributes for screen readers.

#### internal_accessibility.role?

> `optional` **role**: `"button"` \| `"checkbox"` \| `"combobox"` \| `"list"` \| `"listbox"` \| `"listitem"` \| `"menu"` \| `"menuitem"` \| `"option"` \| `"progressbar"` \| `"radio"` \| `"radiogroup"` \| `"tab"` \| `"tablist"` \| `"table"` \| `"textbox"` \| `"timer"` \| `"toolbar"`

ARIA role for the element.

#### internal_accessibility.state?

> `optional` **state**: `object`

ARIA state values for the element.

#### internal_accessibility.state.busy?

> `optional` **busy**: `boolean`

Whether the element is busy.

#### internal_accessibility.state.checked?

> `optional` **checked**: `boolean`

Whether the element is checked.

#### internal_accessibility.state.disabled?

> `optional` **disabled**: `boolean`

Whether the element is disabled.

#### internal_accessibility.state.expanded?

> `optional` **expanded**: `boolean`

Whether the element is expanded.

#### internal_accessibility.state.multiline?

> `optional` **multiline**: `boolean`

Whether the element accepts multiline input.

#### internal_accessibility.state.multiselectable?

> `optional` **multiselectable**: `boolean`

Whether multiple items can be selected.

#### internal_accessibility.state.readonly?

> `optional` **readonly**: `boolean`

Whether the element is read-only.

#### internal_accessibility.state.required?

> `optional` **required**: `boolean`

Whether the element is required.

#### internal_accessibility.state.selected?

> `optional` **selected**: `boolean`

Whether the element is selected.

### internal_transform?

> `optional` **internal_transform**: [`OutputTransformer`](OutputTransformer.md)

Function to transform the output of this element.

### isStaticDirty?

> `optional` **isStaticDirty**: `boolean`

Whether static nodes need to be re-rendered.

### nodeName

> **nodeName**: [`ElementNames`](ElementNames.md)

Name of the element type.

### onComputeLayout()?

> `optional` **onComputeLayout**: () => `void`

Callback to compute layout before rendering.

#### Returns

`void`

### onImmediateRender()?

> `optional` **onImmediateRender**: () => `void`

Callback to trigger an immediate render.

#### Returns

`void`

### onRender()?

> `optional` **onRender**: () => `void`

Callback to trigger a render.

#### Returns

`void`

### resizeObservers?

> `optional` **resizeObservers**: `Set`\<`SizeObserver`\>

Set of resize observers attached to this element.

### staticNode?

> `optional` **staticNode**: `DOMElement`

Reference to the Static component node.
