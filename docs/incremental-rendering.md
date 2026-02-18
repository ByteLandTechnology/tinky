# Incremental rendering guide

[中文](./incremental-rendering.zh-CN.md) ·
[日本語](./incremental-rendering.ja-JP.md)

This guide explains how `incrementalRendering` works in Tinky and how to pick
the right strategy for your CLI. It focuses on behavior that affects rendering
correctness, output stability, and performance.

## Choose a strategy

Tinky supports three effective modes: disabled, line-diff, and run-diff. You
set the mode with the `incrementalRendering` option in `render`.

- `false` or omitted disables incremental rendering.
- `true` enables run-diff mode.
- `{ strategy: "line" }` enables line-diff mode.
- `{ strategy: "run" }` enables run-diff mode.
- `{ enabled: false }` disables incremental rendering.

Use this example as a starting point:

```tsx
import { render } from "tinky";

render(<App />, { incrementalRendering: true });
render(<App />, { incrementalRendering: { strategy: "line" } });
render(<App />, { incrementalRendering: { enabled: false } });
```

## Understand strategy behavior

Both strategies produce the same visual frame, but they write to the terminal
differently. The write pattern affects flicker, update bandwidth, and cursor
movement volume.

- Line-diff compares output by line and rewrites changed lines.
- Run-diff compares per-cell content and writes only changed runs.
- Run-diff usually writes fewer bytes when each frame changes in small regions.
- Line-diff can be easier to reason about if your app changes full lines often.

## Understand runtime fallbacks

Some runtime modes intentionally bypass run-diff, even when you request it.
This keeps behavior predictable in environments where cursor-diff rendering is
not the best fit.

- In `debug` mode, Tinky writes full frames.
- In screen-reader mode, Tinky uses the screen-reader output path.
- In CI mode, Tinky avoids cursor-diff updates.

## Understand output interactions

Interactive rendering coexists with `Static` output and direct stream writes.
You need to know these interactions when you build logging-heavy CLIs.

- New `Static` content is appended once, then the interactive frame is redrawn.
- `useStdout().write(...)` and `useStderr().write(...)` temporarily clear the
  interactive frame and then restore it.
- Transformer-produced trailing spaces are preserved in both line and run modes.

## Benchmark and gate performance

Tinky includes scripts for local benchmark runs and CI-style threshold checks.
Run them when you tune rendering settings or update diff logic.

1. Run `bun run perf:render` to print benchmark samples.
2. Run `bun run perf:gate` to enforce the threshold used in CI.
3. Compare median timings between line-diff and run-diff outputs.

## Troubleshoot rendering issues

If output looks stale or overly noisy, narrow the issue by strategy and runtime
mode first. Most rendering differences are configuration- or environment-driven.

1. Force line mode with `{ strategy: "line" }` and compare output behavior.
2. Disable incremental rendering to confirm whether diffs cause the issue.
3. Check whether `debug`, screen-reader, or CI mode is active.
4. Capture `stdout` writes from hooks to verify frame restoration order.

## Next steps

Use the [API docs for `RenderOptions`](/docs/api/interfaces/RenderOptions.md) for
the complete option contract and defaults.
