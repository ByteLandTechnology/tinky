[**tinky**](../README.md)

---

[tinky](../globals.md) / IncrementalRenderingConfig

# Interface: IncrementalRenderingConfig

User-facing configuration for incremental rendering.

You can use this object form when you need to choose a strategy explicitly
or disable incremental rendering without changing existing option shapes.

## Properties

### enabled?

> `optional` **enabled**: `boolean`

Master on/off switch for object mode.

- `false`: disables incremental rendering, regardless of `strategy`.
- `true` or omitted: enables incremental rendering and uses `strategy`.

---

### strategy?

> `optional` **strategy**: `"line"` \| `"run"`

Diff strategy used for interactive output updates.

- `"line"`: compares line strings and redraws changed lines.
- `"run"`: compares terminal cells and rewrites minimal changed runs.

#### Default Value

```ts
"run";
```
