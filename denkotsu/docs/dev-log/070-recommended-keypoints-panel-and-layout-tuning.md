# 070 Recommended Keypoints Panel And Layout Tuning

- 日付: 2026-02-25

## 依頼/背景
- 要点ページで、カテゴリ進捗と合格力に応じて「今見るべき要点」をすぐ辿れる導線を追加したい。
- おすすめカードの表示崩れを解消し、カテゴリ表示はタグ表現を維持しつつ、情報を読み取りやすい行構成にしたい。

## 実施内容
- `src/lib/key-point-recommendations.ts` を新規追加し、以下を考慮した推薦ロジックを実装。
  - 合格力が低いカテゴリを優先
  - 選択中カテゴリがある場合は該当カテゴリを優先
  - 初学習時はカテゴリ重みを踏まえて分散推薦
- `src/lib/key-point-recommendations.test.ts` を新規追加し、主要分岐をユニットテスト化。
- `src/app/learn/page.tsx` を更新。
  - 「おすすめ要点」パネルを追加
  - おすすめクリックで該当カードへスクロールしつつ展開
  - おすすめカードの表示を「カテゴリタグ / 理由 / タイトル」の3行に整理
  - カテゴリはタグ（ピル）UIを維持し、折り返し崩れを抑制

## 検証結果
- `npm run lint` : 成功
- `npm run check:data` : 成功
- `npm run build` : 成功
  - AdSense未設定に関する既知の警告ログは表示されるが、ビルド自体は正常完了

## 変更ファイル
- `src/app/learn/page.tsx`
- `src/lib/key-point-recommendations.ts`
- `src/lib/key-point-recommendations.test.ts`
