# 076 Adsense Content Quality Remediation

- 日付: 2026-04-06

## 依頼/背景
- AdSense 審査で「ポリシー違反: 有用性の低いコンテンツ」と判定された。
- アプリとしての機能価値はある一方で、審査観点では「静的に読める説明量」「独自性の伝達」「信頼ページ」「クロール可能な導線」が不足していたため、サイト全体を再構成した。

## 実施内容
- トップページを説明型ランディングへ再構成し、SSR で読める本文、学習導線、FAQ、主要コンテンツ紹介を追加。
- ホームの既存クイズ体験は `HomeQuizClient` に分離し、説明コンテンツの下に配置。
- 信頼ページを追加:
  - `about`
  - `privacy`
  - `terms`
  - `contact`
- 記事型ガイドデータと公開ページを追加し、学科/技能の背景知識を静的ページで読めるようにした。
- 要点を個別 URL で公開する `key-points` ルートを追加し、各要点を検索・再訪・共有しやすくした。
- 技能試験の候補問題・欠陥判定を個別 URL で公開し、実技トップ・複線図練習・欠陥判定クイズから詳細ページへ遷移できるようにした。
- 共通フッターを追加し、信頼ページと主要コンテンツへの内部リンクを全体に展開。
- `metadataBase`、Open Graph、canonical、`robots.txt`、`sitemap.xml` を整備。
- `output: export` と両立するため、`robots.ts` と `sitemap.ts` を静的扱いに調整。

## 検証結果
- `npm run lint`
- `npm run check:data`
- `npm run build`
- いずれも成功

## 変更ファイル
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/about/page.tsx`
- `src/app/privacy/page.tsx`
- `src/app/terms/page.tsx`
- `src/app/contact/page.tsx`
- `src/app/guides/page.tsx`
- `src/app/guides/[slug]/page.tsx`
- `src/app/key-points/page.tsx`
- `src/app/key-points/[id]/page.tsx`
- `src/app/practical/page.tsx`
- `src/app/practical/wiring/page.tsx`
- `src/app/practical/wiring/[id]/page.tsx`
- `src/app/practical/defects/page.tsx`
- `src/app/practical/defects/[id]/page.tsx`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/components/home/HomeQuizClient.tsx`
- `src/components/layout/SiteFooter.tsx`
- `src/lib/guides.ts`
- `src/lib/site.ts`
