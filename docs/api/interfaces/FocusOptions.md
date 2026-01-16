[**tinky**](../README.md)

---

[tinky](../globals.md) / FocusOptions

# Interface: FocusOptions

Options for the useFocus hook.

## Properties

### autoFocus?

> `optional` **autoFocus**: `boolean`

Auto-focus this component if there's no active (focused) component right
now.

#### Default Value

```ts
false;
```

---

### id?

> `optional` **id**: `string`

Assign an ID to this component, so it can be programmatically focused with
`focus(id)`.

---

### isActive?

> `optional` **isActive**: `boolean`

Enable or disable this component's focus, while still maintaining its
position in the list of focusable components.

#### Default Value

```ts
true;
```
