[**tinky**](../README.md)

---

[tinky](../globals.md) / StdoutProps

# Interface: StdoutProps

Props for StdoutContext.

## Properties

### stdout

> `readonly` **stdout**: [`WriteStream`](WriteStream.md)

Stdout stream passed to `render()` in `options.stdout` or
`process.stdout` by default.

---

### write()

> `readonly` **write**: (`data`) => `void`

Write any string to stdout while preserving Tinky's output. It's useful
when you want to display external information outside of Tinky's rendering
and ensure there's no conflict. It's similar to `<Static>`, but can't
accept components; it only works with strings.

#### Parameters

##### data

`string`

#### Returns

`void`
