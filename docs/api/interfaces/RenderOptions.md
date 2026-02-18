[**tinky**](../README.md)

---

[tinky](../globals.md) / RenderOptions

# Interface: RenderOptions

Options for the render function.

## Properties

### debug?

> `optional` **debug**: `boolean`

If true, each update will be rendered as separate output, without
replacing.

#### Default Value

```ts
false;
```

---

### env?

> `optional` **env**: `Record`\<`string`, `string` \| `undefined`\>

Environment variables.

#### Default Value

```ts
process.env;
```

---

### exitOnCtrlC?

> `optional` **exitOnCtrlC**: `boolean`

Configure whether Tinky should listen for Ctrl+C keyboard input and exit.
This is needed in raw mode, where Ctrl+C is ignored by default.

#### Default Value

```ts
true;
```

---

### incrementalRendering?

> `optional` **incrementalRendering**: [`IncrementalRenderingOption`](../type-aliases/IncrementalRenderingOption.md)

Configure incremental rendering mode.

- `true`: Enables run-diff incremental rendering.
- `false` or omitted: Disables incremental rendering.
- Object mode:
  - `{ enabled: false }` disables incremental rendering.
  - `{ strategy: "line" }` enables line-diff incremental rendering.
  - `{ strategy: "run" }` (or omitted strategy) enables run-diff rendering.

Runtime notes:

- In `debug` mode, Tinky always writes full frames.
- In screen-reader mode, Tinky uses the screen-reader output path.
- In CI mode, Tinky avoids cursor-diff updates.

#### Default Value

```ts
false;
```

---

### isScreenReaderEnabled?

> `optional` **isScreenReaderEnabled**: `boolean`

Enable screen reader support.

#### Default Value

```ts
process.env["TINKY_SCREEN_READER"] === "true";
```

---

### maxFps?

> `optional` **maxFps**: `number`

Maximum frames per second for render updates.
Controls how frequently UI can update to prevent excessive re-rendering.
Higher values allow more frequent updates but may impact performance.

#### Default Value

```ts
30;
```

---

### onRender()?

> `optional` **onRender**: (`metrics`) => `void`

runs the given callback after each render and re-render.

#### Parameters

##### metrics

[`RenderMetrics`](RenderMetrics.md)

Performance metrics of the render.

#### Returns

`void`

---

### patchConsole?

> `optional` **patchConsole**: `boolean`

Patch console methods to ensure console output doesn't mix with Tinky's.

#### Default Value

```ts
true;
```

---

### stderr?

> `optional` **stderr**: [`WriteStream`](WriteStream.md)

Error stream.

#### Default Value

```ts
process.stderr;
```

---

### stdin?

> `optional` **stdin**: [`ReadStream`](ReadStream.md)

Input stream where the app will listen for input.

#### Default Value

```ts
process.stdin;
```

---

### stdout?

> `optional` **stdout**: [`WriteStream`](WriteStream.md)

Output stream where the app will be rendered.

#### Default Value

```ts
process.stdout;
```
