[**tinky**](../README.md)

---

[tinky](../globals.md) / Instance

# Interface: Instance

Interface for the Tinky instance returned by render.

## Properties

### cleanup()

> **cleanup**: () => `void`

Cleanup the instance from the instances map.

#### Returns

`void`

---

### clear()

> **clear**: () => `void`

Clear output.

#### Returns

`void`

---

### rerender()

> **rerender**: (`node`) => `void`

Replace the previous root node with a new one or update props of current
root.

Renders the given React node.

#### Parameters

##### node

`ReactNode`

The React node to render.

#### Returns

`void`

#### Param

The new React node to render.

---

### unmount()

> **unmount**: (`error?`) => `void`

Manually unmount the whole Tinky app.

Unmounts the Tinky app.

#### Parameters

##### error?

Optional error object or exit code.

`number` | `Error` | `null`

#### Returns

`void`

#### Param

Optional error or exit code.

---

### waitUntilExit()

> **waitUntilExit**: () => `Promise`\<`void`\>

Returns a promise that resolves when the app is unmounted.

Waits until the app exits.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the app exits.

#### Returns

A promise that resolves when the app is unmounted.
