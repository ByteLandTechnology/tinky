[**tinky**](../README.md)

---

[tinky](../globals.md) / StdinProps

# Interface: StdinProps

Props for the StdinContext.

## Properties

### internal_eventEmitter

> `readonly` **internal_eventEmitter**: [`EventEmitter`](../classes/EventEmitter.md)

Internal event emitter for handling input events.

---

### internal_exitOnCtrlC

> `readonly` **internal_exitOnCtrlC**: `boolean`

Internal flag to check if exit on Ctrl+C is enabled.

---

### isRawModeSupported

> `readonly` **isRawModeSupported**: `boolean`

A boolean flag determining if the current `stdin` supports `setRawMode`.
A component using `setRawMode` might want to use `isRawModeSupported` to
nicely fall back in environments where raw mode is not supported.

---

### setRawMode()

> `readonly` **setRawMode**: (`value`) => `void`

Tinky exposes this function via own `<StdinContext>` to handle Ctrl+C,
so use Tinky's `setRawMode` instead of `process.stdin.setRawMode`. If the
`stdin` stream passed to Tinky doesn't support setRawMode, this does
nothing.

#### Parameters

##### value

`boolean`

#### Returns

`void`

---

### stdin

> `readonly` **stdin**: [`ReadStream`](ReadStream.md)

The stdin stream passed to `render()` in `options.stdin`, or
`process.stdin` by default. Useful if your app needs to handle user input.
