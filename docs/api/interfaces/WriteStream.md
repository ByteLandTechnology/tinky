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
  on: (event, listener) => {
    return myStream;
  },
  off: (event, listener) => {
    return myStream;
  },
  once: (event, listener) => {
    return myStream;
  },
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

### off()

> **off**(`event`, `listener`): `this`

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

### on()

> **on**(`event`, `listener`): `this`

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

### once()

> **once**(`event`, `listener`): `this`

Register a one-time event listener.

#### Parameters

##### event

`string`

The event name.

##### listener

(...`args`) => `void`

The callback function.

#### Returns

`this`

The stream instance for chaining.

---

### write()

#### Call Signature

> **write**(`buffer`, `cb?`): `boolean`

Writes data to the stream.

##### Parameters

###### buffer

The data to write as a Uint8Array.

`string` | `Uint8Array`\<`ArrayBufferLike`\>

###### cb?

(`err?`) => `void`

Optional callback to be invoked when the write is complete.

##### Returns

`boolean`

`true` if the string has been flushed to the kernel buffer.

#### Call Signature

> **write**(`str`, `encoding?`, `cb?`): `boolean`

Writes a string to the stream.

##### Parameters

###### str

`string`

The string to write.

###### encoding?

`string`

The encoding to use (e.g., 'utf8').

###### cb?

(`err?`) => `void`

Optional callback to be invoked when the write is complete.

##### Returns

`boolean`

`true` if the string has been flushed to the kernel buffer.
