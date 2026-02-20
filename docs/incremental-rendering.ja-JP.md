# 増分レンダリングガイド

[English](./incremental-rendering.md) ·
[中文](./incremental-rendering.zh-CN.md)

このガイドでは、Tinky の `incrementalRendering` がどのように動作するかと、
CLI に適した戦略の選び方を説明します。レンダリングの正確性、出力の安定性、
性能に影響する挙動に焦点を当てます。

## 戦略を選ぶ

Tinky には実質的に 3 つのモードがあります。無効、line-diff、run-diff です。
`render` の `incrementalRendering` で設定します。

- `false` または未指定: 増分レンダリングを無効化。
- `true`: run-diff を有効化。
- `{ strategy: "line" }`: line-diff を有効化。
- `{ strategy: "run" }`: run-diff を有効化。
- `{ enabled: false }`: 増分レンダリングを無効化。

次の例から始められます。

```tsx
import { render } from "tinky";

render(<App />, { incrementalRendering: true });
render(<App />, { incrementalRendering: { strategy: "line" } });
render(<App />, { incrementalRendering: { enabled: false } });
```

## 戦略ごとの挙動を理解する

どちらの戦略も最終的な見た目は同じですが、ターミナルへの書き込み方が異なり
ます。書き込みパターンはちらつき、更新帯域、カーソル移動量に影響します。

- line-diff は行単位で比較し、変更行を再描画します。
- run-diff はセル単位で比較し、変更された連続区間のみを書き込みます。
- レンダリングフレームに変化がない場合、run-diff はターミナル書き込みを完全にスキップします。
- 各フレームの変更が局所的な場合、run-diff はより少ないバイトで更新できる
  ことが多くあります。
- アプリが行全体を更新することが多い場合は、line-diff の方が挙動を追いやす
  いことがあります。

## ランタイムのフォールバックを理解する

run-diff を要求していても、一部の実行モードでは互換性と安定性のために非
run パスへフォールバックします。

- `debug` モードでは、Tinky は常にフルフレームを書き込みます。
- スクリーンリーダーモードでは、専用の出力パスを使います。
- CI 環境では、カーソル差分更新を避けます。

## 出力との相互作用を理解する

インタラクティブフレームは `Static` 出力や直接ストリーム書き込みと共存しま
す。ログが多い CLI では、この相互作用を理解することが重要です。

- 新しい `Static` 内容は先に追記され、その後にインタラクティブフレームが
  再描画されます。
- `useStdout().write(...)` と `useStderr().write(...)` は、インタラクティ
  ブフレームを一時的に消去し、書き込み後に復元します。
- transformer が生成した行末スペースは、line と run の両モードで保持され
  ます。

## ベンチマーク

Tinky にはシナリオベースのベンチマークスイートが含まれています。
レンダリング設定、レイアウト境界、または差分ロジックを調整するときに実行してください。

1. `bun run benchmark` を実行して全シナリオを計測します。
2. 生成された `docs/benchmark.md` で出力サイズとレンダリング速度を確認します。
3. 全体指標 `speed vs ink` を確認し、差分計算のオーバーヘッドが低く保たれているかチェックします。

## レンダリング問題を切り分ける

出力の残りやノイズがある場合は、まず戦略とランタイムモードの 2 軸で切り分
けてください。多くの差異は設定か環境に起因します。

1. `{ strategy: "line" }` に切り替えて挙動差を確認します。
2. 増分レンダリングを無効化して、問題が diff パス由来か確認します。
3. `debug`、スクリーンリーダー、CI モードの有効状態を確認します。
4. hooks の `stdout` 書き込み順序を取得し、フレーム復元順を確認します。

## 次のステップ

完全なオプション仕様と既定値は、
[`RenderOptions` API ドキュメント](/docs/api/interfaces/RenderOptions.md)
を参照してください。
