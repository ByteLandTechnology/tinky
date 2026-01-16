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

> `optional` **incrementalRendering**: `boolean`

Enable incremental rendering mode which only updates changed lines instead
of redrawing the entire output. Reduces flickering and improves
performance.

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

> `optional` **stderr**: `WriteStream`

Error stream.

#### Default Value

```ts
process.stderr;
```

---

### stdin?

> `optional` **stdin**: `ReadStream`

Input stream where the app will listen for input.

#### Default Value

```ts
process.stdin;
```

---

### stdout?

> `optional` **stdout**: `WriteStream`

Output stream where the app will be rendered.

#### Default Value

```ts
process.stdout;
```
