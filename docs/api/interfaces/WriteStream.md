[**tinky**](../README.md)

---

[tinky](../globals.md) / WriteStream

# Interface: WriteStream

Interface representing a writable stream (e.g., stdout/stderr).
This abstracts away Node.js's WriteStream to make Tinky environment-agnostic.

## Remarks

This interface provides the minimal set of methods required by Tinky to render output.
It mimics the Node.js `process.stdout` and `process.stderr` interfaces but is decoupled
from the Node.js runtime types.

## Example

```typescript
const myStream: WriteStream = {
  write: (str) => {
    console.log(str);
    return true;
  },
  columns: 80,
  rows: 24,
};
```

## Properties

### columns?

> `optional` **columns**: `number`

Number of columns in the terminal.

#### Remarks

This property is used by Tinky to calculate layout and wrap text.
If undefined, Tinky may fall back to a default width (e.g., 80).

---

### rows?

> `optional` **rows**: `number`

Number of rows in the terminal.

#### Remarks

This property is used by Tinky to handle clearing the screen or scrolling.

## Methods

### off()?

> `optional` **off**(`event`, `listener`): `this`

Remove an event listener.

#### Parameters

##### event

`string`

The event name.

##### listener

(...`args`) => `void`

The callback function to remove.

#### Returns

`this`

The stream instance for chaining.

---

### on()?

> `optional` **on**(`event`, `listener`): `this`

Register an event listener.

#### Parameters

##### event

`string`

The event name (e.g., 'resize').

##### listener

(...`args`) => `void`

The callback function.

#### Returns

`this`

The stream instance for chaining.

---

### write()

> **write**(`str`, `encoding?`, `cb?`): `boolean`

Writes a string to the stream.

#### Parameters

##### str

`string`

The string to write.

##### encoding?

`string`

The encoding to use (e.g., 'utf8').

##### cb?

(`err?`) => `void`

Optional callback to be invoked when the write is complete.

#### Returns

`boolean`

`true` if the string has been flushed to the kernel buffer.
