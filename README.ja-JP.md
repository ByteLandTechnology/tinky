# ![Tinky](./tinky.svg) Tinky

**Taffy レイアウトエンジンで再構築された React CLI フレームワーク**

[English](./README.md) · [中文](./README.zh-CN.md)

---

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/tinky.svg)](https://www.npmjs.com/package/tinky)

Tinky は、美しくインタラクティブなコマンドラインインターフェースを構築するための、モダンな React ベースのフレームワークです。強力な [Taffy](https://github.com/DioxusLabs/taffy) レイアウトエンジンを活用し、ターミナルで **CSS Flexbox と Grid** レイアウトをサポートします。

## ✨ 特徴

- 🎨 **React コンポーネント** — 使い慣れた React パターンと JSX 構文で CLI を構築
- 📐 **Flexbox & Grid レイアウト** — Taffy による完全な CSS Flexbox と CSS Grid サポート
- ⌨️ **キーボード入力** — キーボード入力とフォーカス管理のための組み込みフック
- 🎯 **フォーカス管理** — Tab/Shift+Tab ナビゲーションとカスタマイズ可能なフォーカス動作
- 🖼️ **ボーダーと背景** — ボーダー、背景色などの豊富なスタイリング
- ♿ **アクセシビリティ** — ARIA 属性によるスクリーンリーダーサポート
- 🔄 **ホットリロード** — React DevTools サポートによる高速開発
- 📦 **TypeScript ファースト** — 包括的な型定義による完全な TypeScript サポート

## 📦 インストール

```bash
# npm を使用
npm install tinky react

# yarn を使用
yarn add tinky react

# pnpm を使用
pnpm add tinky react

# bun を使用
bun add tinky react
```

## 🚀 クイックスタート

```tsx
import { render, Box, Text } from "tinky";

function App() {
  return (
    <Box flexDirection="column" padding={1}>
      <Text color="green" bold>
        こんにちは、Tinky！🎉
      </Text>
      <Text>React で美しい CLI を構築しよう</Text>
    </Box>
  );
}

render(<App />);
```

## 📚 コンポーネント

### Box

`<Box>` コンポーネントは基本的な構成要素です。ブラウザの `<div>` のようなもので、Flexbox と Grid レイアウトをサポートします。

```tsx
import { Box, Text } from "tinky";

// Flexbox レイアウト
<Box flexDirection="row" gap={2}>
  <Text>左</Text>
  <Text>右</Text>
</Box>

// Grid レイアウト
<Box display="grid" gridTemplateColumns="1fr 2fr 1fr" gap={1}>
  <Text>列 1</Text>
  <Text>列 2</Text>
  <Text>列 3</Text>
</Box>

// ボーダーとパディング付き
<Box borderStyle="round" borderColor="cyan" padding={1}>
  <Text>スタイル付き Box</Text>
</Box>
```

### Text

`<Text>` コンポーネントは、色、太字、斜体などのスタイル付きテキストをレンダリングします。

```tsx
import { Text } from "tinky";

<Text color="blue">青いテキスト</Text>
<Text backgroundColor="red" color="white">ハイライト</Text>
<Text bold italic underline>スタイル付きテキスト</Text>
<Text color="#ff6600">16進数カラーも使えます！</Text>
```

### Static

`<Static>` コンポーネントは、更新されない静的コンテンツをレンダリングします。ログや履歴に最適です。

```tsx
import { Static, Text } from "tinky";

const logs = ["ログ 1", "ログ 2", "ログ 3"];

<Static items={logs}>{(log, index) => <Text key={index}>{log}</Text>}</Static>;
```

### Transform

`<Transform>` コンポーネントを使用すると、子要素の出力を変換できます。

```tsx
import { Transform, Text } from "tinky";

<Transform transform={(output) => output.toUpperCase()}>
  <Text>hello</Text>
</Transform>;
// レンダリング結果: HELLO
```

### Newline と Spacer

```tsx
import { Box, Text, Newline, Spacer } from "tinky";

// Newline - 垂直方向のスペースを追加
<Box flexDirection="column">
  <Text>1行目</Text>
  <Newline count={2} />
  <Text>2行目</Text>
</Box>

// Spacer - flex コンテナ内の柔軟なスペース
<Box>
  <Text>左</Text>
  <Spacer />
  <Text>右</Text>
</Box>
```

## 🪝 フック

### useInput

コンポーネント内でキーボード入力を処理します。

```tsx
import { useInput, useApp } from "tinky";

function MyComponent() {
  const { exit } = useApp();

  useInput((input, key) => {
    if (key.escape) {
      exit();
    }
    if (key.upArrow) {
      // 上矢印キーを処理
    }
    if (input === "q") {
      exit();
    }
  });

  return <Text>'q' を押して終了</Text>;
}
```

### useApp

アプリインスタンスにアクセスして終了動作を制御します。

```tsx
import { useApp } from "tinky";

function MyComponent() {
  const { exit } = useApp();

  // エラーで終了
  exit(new Error("エラーが発生しました"));

  // 正常終了
  exit();
}
```

### useFocus と useFocusManager

インタラクティブコンポーネントのフォーカスを管理します。

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

stdin、stdout、stderr ストリームに直接アクセスします。

```tsx
import { useStdout, useEffect } from "tinky";

function MyComponent() {
  const { write } = useStdout();

  useEffect(() => {
    write("stdout からこんにちは！\n");
  }, []);

  return null;
}
```

## 🎨 スタイリング

### Flexbox プロパティ

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

### Grid プロパティ

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

### ボーダースタイル

```tsx
<Box borderStyle="single" />   // ┌─┐
<Box borderStyle="double" />   // ╔═╗
<Box borderStyle="round" />    // ╭─╮
<Box borderStyle="bold" />     // ┏━┓
<Box borderStyle="classic" />  // +--+
```

### カラー

Tinky は複数のカラー形式をサポートしています：

```tsx
<Text color="red" />                    // 名前付きカラー
<Text color="#ff6600" />                // 16進数カラー
<Text color="rgb(255, 102, 0)" />       // RGB カラー
<Text color="ansi256:208" />            // ANSI 256 カラー
```

## 🔧 API リファレンス

完全な API ドキュメントは [API ドキュメント](./docs/api/globals.md) を参照してください。

### render(element, options?)

React 要素をターミナルにレンダリングします。

```tsx
import { render } from "tinky";

const { unmount, waitUntilExit, rerender, clear } = render(<App />, {
  stdout: process.stdout,
  stdin: process.stdin,
  stderr: process.stderr,
  exitOnCtrlC: true,
  patchConsole: true,
});

// アプリの終了を待機
await waitUntilExit();

// 新しい props で再レンダリング
rerender(<App newProp={true} />);

// アプリをアンマウント
unmount();

// 出力をクリア
clear();
```

### incrementalRendering

`incrementalRendering` を使うと、Tinky がインタラクティブフレームを更新する
方法を選べます。run モードはターミナルセル単位で diff し、変更区間だけを書
き込みます。line モードは行単位で diff し、変更行を再描画します。

```tsx
import { render } from "tinky";

render(<App />, {
  // 次と同じ: { strategy: "run" }
  incrementalRendering: true,
});

render(<App />, {
  incrementalRendering: { strategy: "line" },
});

render(<App />, {
  incrementalRendering: { enabled: false },
});
```

`debug`、スクリーンリーダー、CI 環境では、Tinky は自動的に非 run パスへ
フォールバックします。戦略の比較と挙動の詳細は
[増分レンダリングガイド](./docs/incremental-rendering.ja-JP.md) を参照して
ください。

### measureElement(ref)

レンダリングされた要素のサイズを測定します。

```tsx
import { measureElement, Box, useRef, useEffect } from "tinky";

function MyComponent() {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      const { width, height } = measureElement(ref.current);
      console.log(`サイズ: ${width}x${height}`);
    }
  }, []);

  return <Box ref={ref}>コンテンツ</Box>;
}
```

## 🧪 テスト

Tinky は Bun を使用してテストを行います。テストスイートを実行：

```bash
bun test
```

増分レンダリングのローカルベンチマークを実行するには、次を実行します。

```bash
bun run perf:render
```

CI と同じ性能ゲートを実行するには、次を実行します。

```bash
bun run perf:gate
```

## 📄 ライセンス

MIT © [ByteLandTechnology](https://github.com/ByteLandTechnology)

## 🙏 謝辞

- [Ink](https://github.com/vadimdemedes/ink) — オリジナルの React CLI フレームワーク
- [Taffy](https://github.com/DioxusLabs/taffy) — 高性能 CSS レイアウトエンジン
- [React](https://reactjs.org/) — これを可能にした UI ライブラリ
