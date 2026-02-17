# 015: 設定アイコンの視認性崩れを修正

**日付**: 2026-02-17

## やり取りの内容

ユーザーから「設定ボタンのアイコンが崩れて見える」と指摘。

## 原因

- `BottomNav` の設定アイコンが、複雑な1本パス構造だったため、16px表示時に潰れて見えるケースがあった。

## 修正内容

- `src/components/layout/BottomNav.tsx`
  - 設定アイコンを、縮小表示に強いシンプル形状へ差し替え
    - 中央円 + 外周円 + 放射状の短線で構成
  - ストローク幅・端処理を調整し、低解像度でも見え方を安定化

## 検証

- `npm run lint`: **OK**
- Playwrightで再確認
  - `/learn` desktop
  - `/learn` mobile viewport
  - 設定アイコンの形状崩れが解消されたことを確認

## 変更ファイル

- `denkotsu/src/components/layout/BottomNav.tsx`
- `denkotsu/docs/dev-log/015-settings-icon-visual-fix.md`
