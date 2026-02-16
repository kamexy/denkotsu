# 009: カテゴリ同期不具合と許容電流の説明不整合を修正

**日付**: 2026-02-16

## 概要
`/learn` ページのカテゴリ同期の不具合修正と、許容電流に関する説明の不整合を解消。

## 変更内容

### 1. `/learn` カテゴリ同期の不具合修正
- **問題**: `/learn?category=laws` から `/learn` へ遷移した際、カテゴリが前の値のまま残る
- **原因**: レンダー時比較パターンで `categoryParam` が null/無効値の場合の分岐がなかった
- **対応**: `else { setSelectedCategory("all"); }` を追加

### 2. 許容電流の説明不整合を修正
- **問題**: q071（VVFケーブル）と et-06（許容電流の要点カード）で、電線種別の条件差が不明確
- **対応**:
  - q071: 「VVFケーブルの許容電流（代表値）」と明記、「電線種別・布設条件で値は変わる」を追記
  - et-06: 例を「IV単線の代表値」と明記、VVFとの条件差に言及

## 変更ファイル
| ファイル | 変更内容 |
|---|---|
| `src/app/learn/page.tsx` | else分岐追加（クエリなし時に "all" へ戻す） |
| `src/data/questions.json` | q071 explanation を明確化 |
| `src/data/key-points.json` | et-06 example を明確化 |

## 検証結果
- `npm run lint`: 0 errors / 6 warnings（既存のみ）
- `npx next build --webpack`: ビルド成功
