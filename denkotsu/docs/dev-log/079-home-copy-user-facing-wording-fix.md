# 079 Home Copy User Facing Wording Fix

- 日付: 2026-04-07

## 依頼/背景
- トップページの `今日の1問` 説明文に、実装都合や変更経緯をそのまま書いたような文言が残っていた。
- ユーザー向けの案内として不自然で、公開サイト上の品質印象も下げるため、利用者が理解しやすい説明へ修正した。

## 実施内容
- `src/app/page.tsx` の `今日の1問` セクション説明文を、内部事情ではなく学習価値が伝わる内容へ差し替えた。
- 変更後は、短時間で取り組める確認クイズであり、学科と技能の理解度チェックに使えることを明示した。

## 検証結果
- `npm run lint`
- `npm run check:data`
- `npm run build`
- いずれも成功

## 変更ファイル
- `src/app/page.tsx`
- `docs/dev-log/079-home-copy-user-facing-wording-fix.md`
