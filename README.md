<p align="center">
  <h1 align="center">Tinky</h1>
  <p align="center">
    <strong>React for CLIs, re-imagined with the Taffy layout engine</strong>
  </p>
  <p align="center">
    <a href="./README.zh-CN.md">中文</a> · <a href="./README.ja-JP.md">日本語</a>
  </p>
</p>

---

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/tinky.svg)](https://www.npmjs.com/package/tinky)

Tinky is a modern React-based framework for building beautiful and interactive command-line interfaces. It leverages the powerful [Taffy](https://github.com/DioxusLabs/taffy) layout engine to provide **CSS Flexbox and Grid** layout support in the terminal.

## ✨ Features

- 🎨 **React Components** — Build CLIs using familiar React patterns and JSX syntax
- 📐 **Flexbox & Grid Layout** — Full CSS Flexbox and CSS Grid support powered by Taffy
- ⌨️ **Keyboard Input** — Built-in hooks for handling keyboard input and focus management
- 🎯 **Focus Management** — Tab/Shift+Tab navigation with customizable focus behavior
- 🖼️ **Borders & Backgrounds** — Rich styling with borders, background colors, and more
- ♿ **Accessibility** — Screen reader support with ARIA attributes
- 🔄 **Hot Reloading** — Fast development with React DevTools support
- 📦 **TypeScript First** — Full TypeScript support with comprehensive type definitions

## 📦 Installation

```bash
# Using npm
npm install tinky react

# Using yarn
yarn add tinky react

# Using pnpm
pnpm add tinky react

# Using bun
bun add tinky react
```

## 🚀 Quick Start

```tsx
import { render, Box, Text } from "tinky";

function App() {
  return (
    <Box flexDirection="column" padding={1}>
      <Text color="green" bold>
        Hello, Tinky! 🎉
      </Text>
      <Text>Build beautiful CLIs with React</Text>
    </Box>
  );
}

render(<App />);
```

## 📚 Components

### Box

The `<Box>` component is a fundamental building block. It's like a `<div>` in the browser, supporting Flexbox and Grid layouts.

```tsx
import { Box, Text } from "tinky";

// Flexbox layout
<Box flexDirection="row" gap={2}>
  <Text>Left</Text>
  <Text>Right</Text>
</Box>

// Grid layout
<Box display="grid" gridTemplateColumns="1fr 2fr 1fr" gap={1}>
  <Text>Col 1</Text>
  <Text>Col 2</Text>
  <Text>Col 3</Text>
</Box>

// With borders and padding
<Box borderStyle="round" borderColor="cyan" padding={1}>
  <Text>Styled Box</Text>
</Box>
```

### Text

The `<Text>` component renders styled text with colors, bold, italic, and more.

```tsx
import { Text } from "tinky";

<Text color="blue">Blue text</Text>
<Text backgroundColor="red" color="white">Highlighted</Text>
<Text bold italic underline>Styled text</Text>
<Text color="#ff6600">Hex colors work too!</Text>
```

### Static

The `<Static>` component renders static content that won't be updated. Perfect for logs and history.

```tsx
import { Static, Text } from "tinky";

const logs = ["Log 1", "Log 2", "Log 3"];

<Static items={logs}>{(log, index) => <Text key={index}>{log}</Text>}</Static>;
```

### Transform

The `<Transform>` component allows you to transform the output of its children.

```tsx
import { Transform, Text } from "tinky";

<Transform transform={(output) => output.toUpperCase()}>
  <Text>hello</Text>
</Transform>;
// Renders: HELLO
```

### Newline & Spacer

```tsx
import { Box, Text, Newline, Spacer } from "tinky";

// Newline - adds vertical space
<Box flexDirection="column">
  <Text>Line 1</Text>
  <Newline count={2} />
  <Text>Line 2</Text>
</Box>

// Spacer - flexible space in flex containers
<Box>
  <Text>Left</Text>
  <Spacer />
  <Text>Right</Text>
</Box>
```

## 🪝 Hooks

### useInput

Handle keyboard input in your components.

```tsx
import { useInput, useApp } from "tinky";

function MyComponent() {
  const { exit } = useApp();

  useInput((input, key) => {
    if (key.escape) {
      exit();
    }
    if (key.upArrow) {
      // Handle up arrow
    }
    if (input === "q") {
      exit();
    }
  });

  return <Text>Press 'q' to quit</Text>;
}
```

### useApp

Access the app instance to control exit behavior.

```tsx
import { useApp } from "tinky";

function MyComponent() {
  const { exit } = useApp();

  // Exit with error
  exit(new Error("Something went wrong"));

  // Exit normally
  exit();
}
```

### useFocus & useFocusManager

Manage focus for interactive components.

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

### useStdin, useStdout, useStderr

Direct access to stdin, stdout, and stderr streams.

```tsx
import { useStdout, useEffect } from "tinky";

function MyComponent() {
  const { write } = useStdout();

  useEffect(() => {
    write("Hello from stdout!\n");
  }, []);

  return null;
}
```

## 🎨 Styling

### Flexbox Properties

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

### Grid Properties

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

### Border Styles

```tsx
<Box borderStyle="single" />   // ┌─┐
<Box borderStyle="double" />   // ╔═╗
<Box borderStyle="round" />    // ╭─╮
<Box borderStyle="bold" />     // ┏━┓
<Box borderStyle="classic" />  // +--+
```

### Colors

Tinky supports multiple color formats:

```tsx
<Text color="red" />                    // Named colors
<Text color="#ff6600" />                // Hex colors
<Text color="rgb(255, 102, 0)" />       // RGB colors
<Text color="ansi256:208" />            // ANSI 256 colors
```

## 🔧 API Reference

For complete API documentation, see the [API Docs](./docs/api/globals.md).

### render(element, options?)

Render a React element to the terminal.

```tsx
import { render } from "tinky";

const { unmount, waitUntilExit, rerender, clear } = render(<App />, {
  stdout: process.stdout,
  stdin: process.stdin,
  stderr: process.stderr,
  exitOnCtrlC: true,
  patchConsole: true,
});

// Wait for the app to exit
await waitUntilExit();

// Rerender with new props
rerender(<App newProp={true} />);

// Unmount the app
unmount();

// Clear the output
clear();
```

### measureElement(ref)

Measure the dimensions of a rendered element.

```tsx
import { measureElement, Box, useRef, useEffect } from "tinky";

function MyComponent() {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      const { width, height } = measureElement(ref.current);
      console.log(`Size: ${width}x${height}`);
    }
  }, []);

  return <Box ref={ref}>Content</Box>;
}
```

## 🧪 Testing

Tinky uses Bun for testing. Run the test suite:

```bash
bun test
```

## 📄 License

MIT © [ByteLandTechnology](https://github.com/ByteLandTechnology)

## 🙏 Acknowledgements

- [Ink](https://github.com/vadimdemedes/ink) — The original React for CLIs
- [Taffy](https://github.com/DioxusLabs/taffy) — High-performance CSS layout engine
- [React](https://reactjs.org/) — The UI library that makes this possible
