[**tinky**](../README.md)

---

[tinky](../globals.md) / FocusManager

# Interface: FocusManager

Focus management control methods.

## Properties

### disableFocus()

> **disableFocus**: () => `void`

Disable focus management for all components. The currently active
component (if there's one) will lose its focus.

#### Returns

`void`

---

### enableFocus()

> **enableFocus**: () => `void`

Enable focus management for all components.

#### Returns

`void`

---

### focus()

> **focus**: (`id`) => `void`

Switch focus to the element with provided `id`. If there's no element with
that `id`, focus will be given to the first focusable component.

#### Parameters

##### id

`string`

#### Returns

`void`

---

### focusNext()

> **focusNext**: () => `void`

Switch focus to the next focusable component. If there's no active
component, focus is given to the first. If active is last, focus wraps.

#### Returns

`void`

---

### focusPrevious()

> **focusPrevious**: () => `void`

Switch focus to the previous focusable component. If there's no active
component right now, focus will be given to the first focusable component.
If the active component is the first in the list of focusable components,
focus will be switched to the last focusable component.

#### Returns

`void`
