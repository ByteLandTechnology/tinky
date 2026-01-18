[**tinky**](../README.md)

---

[tinky](../globals.md) / ReadStream

# Interface: ReadStream

Interface representing a readable stream (e.g., stdin).
This abstracts away Node.js's ReadStream to make Tinky environment-agnostic.

## Remarks

This interface handles input events, primarily for keyboard interaction.

## Example

```typescript
const myStdin: ReadStream = {
  isTTY: true,
};
```

## Properties

### isTTY?

> `optional` **isTTY**: `boolean`

Indicates whether the stream is a TTY (Terminal).

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

The callback function.

#### Returns

`this`

The stream instance.

---

### on()?

> `optional` **on**(`event`, `listener`): `this`

Register an event listener.

#### Parameters

##### event

`string`

The event name (e.g., 'data').

##### listener

(...`args`) => `void`

The callback function.

#### Returns

`this`

The stream instance.

---

### ref()?

> `optional` **ref**(): `void`

Keeps the process alive as long as the stream is active.

#### Returns

`void`

---

### setEncoding()?

> `optional` **setEncoding**(`encoding`): `void`

Sets the character encoding for data read from the stream.

#### Parameters

##### encoding

`string`

The encoding to use (e.g., 'utf8').

#### Returns

`void`

---

### setRawMode()?

> `optional` **setRawMode**(`mode`): `this`

Sets the stream to raw mode.

#### Parameters

##### mode

`boolean`

`true` to enable raw mode, `false` to disable.

#### Returns

`this`

The stream instance.

#### Remarks

Raw mode is required for Tinky to receive character-by-character input
without waiting for Enter to be pressed.

---

### unref()?

> `optional` **unref**(): `void`

Allows the process to exit even if the stream is active.

#### Returns

`void`
