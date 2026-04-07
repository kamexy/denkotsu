import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getAllKeyPoints } from "@/lib/key-points";
import {
  getAbsoluteUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
} from "@/lib/site";
import { ALL_CATEGORIES, CATEGORY_LABELS } from "@/types";

const keyPoints = getAllKeyPoints();
const categoryCounts = ALL_CATEGORIES.reduce<Record<string, number>>(
  (acc, category) => {
    acc[category] = keyPoints.filter((keyPoint) => keyPoint.category === category).length;
    return acc;
  },
  {}
);

export const metadata: Metadata = {
  title: `要点一覧 | ${SITE_NAME}`,
  description:
    "第二種電気工事士の頻出要点を、分野別に整理した静的な学習ページです。公式・解説・例題イメージをまとめて確認できます。",
  alternates: {
    canonical: getAbsoluteUrl("/key-points"),
  },
  openGraph: {
    title: `要点一覧 | ${SITE_TITLE}`,
    description:
      "第二種電気工事士の頻出要点を、分野別に整理した静的な学習ページです。",
    url: getAbsoluteUrl("/key-points"),
    siteName: SITE_NAME,
    type: "website",
  },
};

export default function KeyPointsIndexPage() {
  const totalCount = keyPoints.length;
  const formulaCount = keyPoints.filter((keyPoint) => keyPoint.formula).length;
  const exampleCount = keyPoints.filter((keyPoint) => keyPoint.example).length;

  return (
    <main className="pb-28 px-4 pt-3">
      <header className="panel px-5 py-6">
        <p className="text-[12px] font-semibold tracking-[0.16em] text-slate-500">
          KEY POINTS
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-teal-800">
          要点一覧
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
          {SITE_DESCRIPTION}
          <br />
          分野ごとに整理された要点を、公式・本文・例と一緒に確認できます。
        </p>
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-200 pt-4">
          <StatTile label="総要点数" value={`${totalCount}件`} />
          <StatTile label="公式付き" value={`${formulaCount}件`} />
          <StatTile label="例つき" value={`${exampleCount}件`} />
        </div>
      </header>

      <section className="mt-3 panel p-4">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-base font-semibold text-slate-800">このページの使い方</h2>
        </div>
        <ul className="mt-2 space-y-1 text-sm leading-relaxed text-slate-600">
          <li>・分野ごとに要点をまとめています。</li>
          <li>・各カードから個別ページへ移動できます。</li>
          <li>・個別ページでは公式、本文、例、関連分野の導線を確認できます。</li>
        </ul>
      </section>

      <section className="mt-3 space-y-3">
        {ALL_CATEGORIES.map((category) => {
          const items = keyPoints.filter((keyPoint) => keyPoint.category === category);
          return (
            <section
              key={category}
              id={category}
              className="panel p-4 scroll-mt-24"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                    {CATEGORY_LABELS[category]}
                  </p>
                  <h2 className="mt-2 text-lg font-bold text-slate-900">
                    {CATEGORY_LABELS[category]}の要点
                  </h2>
                </div>
                <p className="text-sm font-semibold text-slate-500">
                  {categoryCounts[category]}件
                </p>
              </div>

              <div className="mt-3 divide-y divide-slate-200">
                {items.map((keyPoint) => (
                  <KeyPointPreviewCard key={keyPoint.id} keyPoint={keyPoint} />
                ))}
              </div>
            </section>
          );
        })}
      </section>

      <section className="mt-3 panel p-4">
        <h2 className="text-base font-semibold text-slate-800">関連ページ</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <LinkChip href="/learn" label="要点チェックへ戻る" />
          <LinkChip href="/practical" label="技能試験対策へ" />
          <LinkChip href="/collection" label="図鑑へ" />
          <LinkChip href="/stats" label="成績を見る" />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

function KeyPointPreviewCard({ keyPoint }: { keyPoint: (typeof keyPoints)[number] }) {
  return (
    <Link
      href={`/key-points/${keyPoint.id}`}
      className="block py-4 first:pt-3 last:pb-1"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
          {CATEGORY_LABELS[keyPoint.category]}
        </span>
        <span className="text-[11px] font-medium text-slate-400">→</span>
      </div>
      <h3 className="mt-2 text-base font-bold text-slate-900">{keyPoint.title}</h3>
      {keyPoint.formula ? (
        <p className="mt-2 text-sm font-semibold text-teal-800">
          {keyPoint.formula}
        </p>
      ) : (
        <p className="mt-2 text-sm font-medium text-slate-500">公式なし</p>
      )}
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        {keyPoint.body}
      </p>
    </Link>
  );
}

function LinkChip({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-white"
    >
      {label}
    </Link>
  );
}
