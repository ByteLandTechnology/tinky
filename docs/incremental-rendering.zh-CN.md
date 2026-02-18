# 增量渲染指南

[English](./incremental-rendering.md) ·
[日本語](./incremental-rendering.ja-JP.md)

本指南说明了 Tinky 中 `incrementalRendering` 的工作方式，以及如何为你的
CLI 选择合适策略。重点是会影响渲染正确性、输出稳定性和性能的行为。

## 选择策略

Tinky 有三种有效模式：关闭、line-diff 和 run-diff。你可以在 `render` 中通过
`incrementalRendering` 设置策略。

- `false` 或省略：关闭增量渲染。
- `true`：启用 run-diff。
- `{ strategy: "line" }`：启用 line-diff。
- `{ strategy: "run" }`：启用 run-diff。
- `{ enabled: false }`：关闭增量渲染。

你可以从下面这个示例开始：

```tsx
import { render } from "tinky";

render(<App />, { incrementalRendering: true });
render(<App />, { incrementalRendering: { strategy: "line" } });
render(<App />, { incrementalRendering: { enabled: false } });
```

## 理解策略行为

两种策略在视觉结果上是一致的，但写入终端的方式不同。写入模式会影响闪烁、
更新带宽和光标移动数量。

- line-diff 按行比较输出，并重写变更行。
- run-diff 按单元格比较输出，只写入变化的连续片段。
- 当每帧只在局部变化时，run-diff 通常写入更少字节。
- 如果你的应用经常整行变化，line-diff 可能更容易理解和调试。

## 理解运行时回退

即使你请求了 run-diff，在部分运行模式下也会主动回退到非 run 路径，以保证
环境兼容性和行为稳定。

- 在 `debug` 模式下，Tinky 始终写入完整帧。
- 在屏幕阅读器模式下，Tinky 使用屏幕阅读器输出路径。
- 在 CI 环境下，Tinky 会避免使用光标差分更新。

## 理解输出交互

交互帧渲染会与 `Static` 输出和直接流写入同时工作。若你的 CLI 日志较多，需
要先理解这些交互规则。

- 新的 `Static` 内容会先追加，然后重新绘制交互帧。
- `useStdout().write(...)` 与 `useStderr().write(...)` 会临时清理交互帧，
  写入完成后再恢复。
- 由 transformer 产生的行尾空格，在 line 与 run 模式下都会被保留。

## 基准测试与性能门禁

Tinky 内置了本地基准脚本和 CI 风格的阈值校验脚本。调整渲染逻辑时建议一起
运行。

1. 运行 `bun run perf:render` 查看基准样本。
2. 运行 `bun run perf:gate` 执行与 CI 一致的门禁校验。
3. 对比 line-diff 与 run-diff 的中位耗时。

## 排查渲染问题

若你看到输出残留、更新噪声过高或闪烁，建议先从“策略 + 运行模式”两个维度
定位问题。大部分差异都来自配置或环境。

1. 切换为 `{ strategy: "line" }`，观察输出是否变化。
2. 完全关闭增量渲染，确认问题是否来自 diff 路径。
3. 检查当前是否开启了 `debug`、屏幕阅读器或 CI 模式。
4. 捕获 hooks 的 `stdout` 写入顺序，确认帧恢复逻辑是否符合预期。

## 下一步

完整参数和默认值请查看
[`RenderOptions` API 文档](/docs/api/interfaces/RenderOptions.md)。
