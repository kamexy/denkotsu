# 008: 品質・正確性・保守性の一括修正

**日付**: 2026-02-16

## 概要
法令データの誤り修正、学習内容の正確性向上、クイズ進行不能バグの修正、lintエラー解消、Service Worker更新性改善、ハードコード解消の6項目を一括対応。

## 変更内容

### 1. 法令誤り修正（q051 / lw-01）
- **問題**: 電気工事士法第14条の罰則が「30万円以下の罰金」になっていた
- **正解**: 「3月以下の懲役又は3万円以下の罰金」
- **対応**: q051の選択肢4つすべてを現実的な罰則表現に修正、correctIndex変更、explanation更新
- **対応**: lw-01の要点カードも同条文に合わせて修正

### 2. 学習内容の正確性向上（q116 / cm-05）
- **問題**: 差込形コネクタについて「電線の組み合わせに制限がない」は不正確
- **正解**: WAGO 221等は導体種別・サイズに仕様上の制限がある
- **対応**: 「制限なし」→「製品仕様の範囲内なら異なる太さの電線も接続できる」に修正
- **対応**: cm-05要点カードも「対応する導体種別・サイズは製品仕様による」に修正
- **注意**: 特定メーカーの値を一般的事実として記述しないよう配慮

### 3. クイズ進行不能バグ修正（useQuiz.ts / page.tsx）
- **問題**: `loadNext()` の catch で `setState("question")` → currentQuestion が null のまま空白画面
- **対応**: `"error"` ステートを追加し、再試行ボタン付きエラーUIを表示
- **問題**: `answer()` で DB書き込み失敗時にフィードバックが表示されない
- **対応**: DB writes を try-catch で囲み、失敗してもフィードバック表示は継続

### 4. lintエラー解消
- **useQuiz.ts**: `Date.now()` を useState の lazy initializer / useRef(0) + callback内代入に変更（`react-hooks/purity`）
- **learn/page.tsx**: useEffect 内の `setSelectedCategory` を React 推奨のレンダー時比較パターンに置換（`react-hooks/set-state-in-effect`）
  - `/learn?category=laws` 等のURLクエリ連動は維持

### 5. Service Worker 更新性改善
- **sw.js**: ナビゲーションをネットワーク優先に変更（更新を即時反映）、静的アセットはキャッシュ優先を維持
- **sw.js**: `/learn` をプリキャッシュ対象に追加、CACHE_VERSION を v2 に更新
- **register-sw.ts**: `updatefound` イベントを監視し、新SWが activated になったらページリロード

### 6. ハードコード解消（settings）
- 問題数「120問」→ `getAllQuestions().length` で動的取得
- バージョン「1.0.0」→ TODO コメントを追加（将来 package.json / 環境変数から取得）

## 変更ファイル
| ファイル | 変更内容 |
|---|---|
| `src/data/questions.json` | q051 選択肢・correctIndex・explanation、q116 選択肢・explanation |
| `src/data/key-points.json` | lw-01 body、cm-05 body |
| `src/hooks/useQuiz.ts` | error ステート追加、Date.now() purity修正、DB書き込みエラーハンドリング |
| `src/app/page.tsx` | エラー状態UI追加 |
| `src/app/learn/page.tsx` | useEffect→レンダー時比較パターン、useEffect import削除 |
| `public/sw.js` | ネットワーク優先戦略、バージョン管理 |
| `src/lib/register-sw.ts` | updatefound イベント監視 |
| `src/app/settings/page.tsx` | 問題数動的取得、バージョンTODO |

## 検証結果
- `npm run lint`: **0 errors**, 6 warnings（既存のimg/未使用変数警告のみ）
- `npx next build --webpack`: **ビルド成功**、全7ルート静的生成完了
