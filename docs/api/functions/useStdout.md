[**tinky**](../README.md)

---

[tinky](../globals.md) / useStdout

# Function: useStdout()

> **useStdout**(): `object`

`useStdout` is a React hook that exposes the stdout stream where Tinky
renders your app.

## Returns

The stdout context.

### stdout

> `readonly` **stdout**: `WriteStream`

Stdout stream passed to `render()` in `options.stdout` or `process.stdout`
by default.

### write()

> `readonly` **write**: (`data`) => `void`

Write any string to stdout while preserving Tinky's output. Similar to
`<Static>`, but only works with strings.

#### Parameters

##### data

`string`

#### Returns

`void`
