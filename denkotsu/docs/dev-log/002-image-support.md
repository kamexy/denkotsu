# 002: 画像対応の実装

**日付**: 2026-02-15（前セッション）

## やり取りの概要

実際の第二種電気工事士試験では画像問題が約4割を占めるため、SVG画像による図記号・回路図・工具イラストをアプリに追加。

## 計画（8ステップ）

既存コードの有利な点を活用：
- `Question`型に `image?: string` フィールドが既に存在
- `QuizCard.tsx`に画像表示UIが実装済み
- `next.config.ts`で `images.unoptimized: true` 設定済み

→ SVGを配置してJSONにパスを書くだけで動作

## 実装内容

### SVG作成（22個）

**symbols/（図記号 10個）**
- switch-single.svg, switch-3way.svg, switch-4way.svg
- switch-pilot.svg, switch-confirm.svg, switch-timer.svg
- outlet-general.svg, outlet-grounded.svg, outlet-wp.svg
- light-ceiling.svg

**circuits/（回路図 6個）**
- series-circuit.svg, parallel-circuit.svg
- 3way-switch-circuit.svg, single-phase-2wire.svg
- single-phase-3wire.svg, single-to-multi.svg（後日追加）

**wiring/（配線 1個）**
- vvf-cable.svg

**tools/（工具・器具 5個）**
- ring-sleeve.svg, push-connector.svg
- cable-stripper.svg, crimping-tool.svg, breaker.svg

### データ変更
- `questions.json`: 新規画像問題20問（q101〜q120）追加、既存15問にimage追加
- `key-points.json`: KeyPoint型に `image?: string` 追加、8枚に画像参照追加
- `src/types/index.ts`: KeyPoint型にimage追加
- `src/app/learn/page.tsx`: KeyPointCardに画像表示UI追加
