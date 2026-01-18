[**tinky**](../README.md)

---

[tinky](../globals.md) / StderrProps

# Interface: StderrProps

Props for StderrContext.

## Properties

### stderr

> `readonly` **stderr**: [`WriteStream`](WriteStream.md)

Stderr stream passed to `render()` in `options.stderr` or `process.stderr`
by default.

---

### write()

> `readonly` **write**: (`data`) => `void`

Write any string to stderr while preserving Tinky's output. It's useful
when you want to display external information outside of Tinky's rendering
and ensure there's no conflict. It's similar to `<Static>`, but can't
accept components; it only works with strings.

#### Parameters

##### data

`string`

#### Returns

`void`
