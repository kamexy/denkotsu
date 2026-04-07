# 080 Key Point Recommendation Affordance Polish

- 日付: 2026-04-07

## 依頼/背景
- `/learn` の「今見るべき要点」で、テキストの `→` が素朴すぎて UI 品質が低く見える。
- どこを押せばよいか分かりづらく、カード全体の押下可能性も弱い。

## 実施内容
- `src/app/learn/page.tsx` の推薦要点パネルを調整。
- 各項目を区切り線ベースから、押下可能性が伝わるカード型レイアウトに変更。
- テキストの `→` をやめ、SVG の導線アイコンに置き換え。
- 右上に小さなアクションアイコン、下部に `この要点を開く` の補助ラベルを追加。
- ホバー/フォーカス時に色が変化するようにし、タップ/クリック対象が明確になるようにした。

## 検証結果
- `npm run lint`
- `npm run check:data`

## 変更ファイル
- `src/app/learn/page.tsx`
- `docs/dev-log/080-key-point-recommendation-affordance-polish.md`
