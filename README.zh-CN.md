<p align="center">
  <h1 align="center">Tinky</h1>
  <p align="center">
    <strong>使用 Taffy 布局引擎重新构想的 React CLI 框架</strong>
  </p>
  <p align="center">
    <a href="./README.md">English</a> · <a href="./README.ja-JP.md">日本語</a>
  </p>
</p>

---

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/tinky.svg)](https://www.npmjs.com/package/tinky)

Tinky 是一个现代化的基于 React 的框架，用于构建美观且交互式的命令行界面。它利用强大的 [Taffy](https://github.com/DioxusLabs/taffy) 布局引擎，在终端中提供 **CSS Flexbox 和 Grid** 布局支持。

## ✨ 特性

- 🎨 **React 组件** — 使用熟悉的 React 模式和 JSX 语法构建 CLI
- 📐 **Flexbox 和 Grid 布局** — 由 Taffy 驱动的完整 CSS Flexbox 和 CSS Grid 支持
- ⌨️ **键盘输入** — 内置处理键盘输入和焦点管理的 hooks
- 🎯 **焦点管理** — Tab/Shift+Tab 导航，可自定义焦点行为
- 🖼️ **边框和背景** — 丰富的边框、背景色等样式支持
- ♿ **无障碍访问** — 支持 ARIA 属性的屏幕阅读器
- 🔄 **热重载** — 支持 React DevTools 的快速开发体验
- 📦 **TypeScript 优先** — 完整的 TypeScript 支持和类型定义

## 📦 安装

```bash
# 使用 npm
npm install tinky react

# 使用 yarn
yarn add tinky react

# 使用 pnpm
pnpm add tinky react

# 使用 bun
bun add tinky react
```

## 🚀 快速开始

```tsx
import { render, Box, Text } from "tinky";

function App() {
  return (
    <Box flexDirection="column" padding={1}>
      <Text color="green" bold>
        你好，Tinky！🎉
      </Text>
      <Text>用 React 构建漂亮的 CLI</Text>
    </Box>
  );
}

render(<App />);
```

## 📚 组件

### Box

`<Box>` 组件是基础构建块。它类似于浏览器中的 `<div>`，支持 Flexbox 和 Grid 布局。

```tsx
import { Box, Text } from "tinky";

// Flexbox 布局
<Box flexDirection="row" gap={2}>
  <Text>左边</Text>
  <Text>右边</Text>
</Box>

// Grid 布局
<Box display="grid" gridTemplateColumns="1fr 2fr 1fr" gap={1}>
  <Text>列 1</Text>
  <Text>列 2</Text>
  <Text>列 3</Text>
</Box>

// 带边框和内边距
<Box borderStyle="round" borderColor="cyan" padding={1}>
  <Text>样式化的 Box</Text>
</Box>
```

### Text

`<Text>` 组件渲染带样式的文本，支持颜色、粗体、斜体等。

```tsx
import { Text } from "tinky";

<Text color="blue">蓝色文本</Text>
<Text backgroundColor="red" color="white">高亮显示</Text>
<Text bold italic underline>样式化文本</Text>
<Text color="#ff6600">也支持十六进制颜色！</Text>
```

### Static

`<Static>` 组件渲染不会更新的静态内容。非常适合日志和历史记录。

```tsx
import { Static, Text } from "tinky";

const logs = ["日志 1", "日志 2", "日志 3"];

<Static items={logs}>{(log, index) => <Text key={index}>{log}</Text>}</Static>;
```

### Transform

`<Transform>` 组件允许你转换其子元素的输出。

```tsx
import { Transform, Text } from "tinky";

<Transform transform={(output) => output.toUpperCase()}>
  <Text>hello</Text>
</Transform>;
// 渲染结果: HELLO
```

### Newline 和 Spacer

```tsx
import { Box, Text, Newline, Spacer } from "tinky";

// Newline - 添加垂直空间
<Box flexDirection="column">
  <Text>第一行</Text>
  <Newline count={2} />
  <Text>第二行</Text>
</Box>

// Spacer - flex 容器中的弹性空间
<Box>
  <Text>左边</Text>
  <Spacer />
  <Text>右边</Text>
</Box>
```

## 🪝 Hooks

### useInput

在组件中处理键盘输入。

```tsx
import { useInput, useApp } from "tinky";

function MyComponent() {
  const { exit } = useApp();

  useInput((input, key) => {
    if (key.escape) {
      exit();
    }
    if (key.upArrow) {
      // 处理上箭头
    }
    if (input === "q") {
      exit();
    }
  });

  return <Text>按 'q' 退出</Text>;
}
```

### useApp

访问应用实例以控制退出行为。

```tsx
import { useApp } from "tinky";

function MyComponent() {
  const { exit } = useApp();

  // 带错误退出
  exit(new Error("出错了"));

  // 正常退出
  exit();
}
```

### useFocus 和 useFocusManager

管理交互式组件的焦点。

```tsx
import { useFocus, Box, Text } from "tinky";

function FocusableItem({ label }: { label: string }) {
  const { isFocused } = useFocus();

  return (
    <Box borderStyle={isFocused ? "bold" : "single"}>
      <Text color={isFocused ? "green" : "white"}>{label}</Text>
    </Box>
  );
}
```

### useStdin、useStdout、useStderr

直接访问 stdin、stdout 和 stderr 流。

```tsx
import { useStdout, useEffect } from "tinky";

function MyComponent() {
  const { write } = useStdout();

  useEffect(() => {
    write("来自 stdout 的问候！\n");
  }, []);

  return null;
}
```

## 🎨 样式

### Flexbox 属性

```tsx
<Box
  flexDirection="row" // row, row-reverse, column, column-reverse
  justifyContent="center" // flex-start, flex-end, center, space-between, space-around
  alignItems="center" // flex-start, flex-end, center, stretch
  flexWrap="wrap" // nowrap, wrap, wrap-reverse
  flexGrow={1}
  flexShrink={0}
  gap={2}
/>
```

### Grid 属性

```tsx
<Box
  display="grid"
  gridTemplateColumns="1fr 2fr 1fr"
  gridTemplateRows="auto 1fr"
  columnGap={1}
  rowGap={1}
  justifyItems="center"
  alignItems="center"
/>
```

### 边框样式

```tsx
<Box borderStyle="single" />   // ┌─┐
<Box borderStyle="double" />   // ╔═╗
<Box borderStyle="round" />    // ╭─╮
<Box borderStyle="bold" />     // ┏━┓
<Box borderStyle="classic" />  // +--+
```

### 颜色

Tinky 支持多种颜色格式：

```tsx
<Text color="red" />                    // 命名颜色
<Text color="#ff6600" />                // 十六进制颜色
<Text color="rgb(255, 102, 0)" />       // RGB 颜色
<Text color="ansi256:208" />            // ANSI 256 颜色
```

## 🔧 API 参考

### render(element, options?)

将 React 元素渲染到终端。

```tsx
import { render } from "tinky";

const { unmount, waitUntilExit, rerender, clear } = render(<App />, {
  stdout: process.stdout,
  stdin: process.stdin,
  stderr: process.stderr,
  exitOnCtrlC: true,
  patchConsole: true,
});

// 等待应用退出
await waitUntilExit();

// 使用新 props 重新渲染
rerender(<App newProp={true} />);

// 卸载应用
unmount();

// 清除输出
clear();
```

### measureElement(ref)

测量已渲染元素的尺寸。

```tsx
import { measureElement, Box, useRef, useEffect } from "tinky";

function MyComponent() {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      const { width, height } = measureElement(ref.current);
      console.log(`尺寸: ${width}x${height}`);
    }
  }, []);

  return <Box ref={ref}>内容</Box>;
}
```

## 🧪 测试

Tinky 使用 Bun 进行测试。运行测试套件：

```bash
bun test
```

## 📄 许可证

MIT © [ByteLandTechnology](https://github.com/ByteLandTechnology)

## 🙏 致谢

- [Ink](https://github.com/vadimdemedes/ink) — 原版 React CLI 框架
- [Taffy](https://github.com/DioxusLabs/taffy) — 高性能 CSS 布局引擎
- [React](https://reactjs.org/) — 使这一切成为可能的 UI 库
