import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getAllGuides, getGuideCategoryLabel } from "@/lib/guides";
import { SITE_DESCRIPTION, SITE_TITLE, getAbsoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "学習ガイド",
  description:
    "第二種電気工事士の学科・技能を深く学べる記事型ガイド集。要点、配線図、法規、器具、技能試験の考え方を読み物として整理しています。",
  alternates: {
    canonical: getAbsoluteUrl("/guides"),
  },
};

export default function GuidesIndexPage() {
  const guides = getAllGuides();
  const categories = Array.from(
    new Set(guides.map((guide) => getGuideCategoryLabel(guide.category)))
  );

  return (
    <main className="pb-28 px-4 pt-3">
      <header className="panel px-5 py-6">
        <p className="text-[12px] font-semibold tracking-[0.18em] text-slate-500">
          GUIDES
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-teal-800">
          学習ガイド
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          {SITE_DESCRIPTION}
        </p>
        <div className="mt-5 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-3">
          <GuideMeta label="公開ガイド" value={`${guides.length}本`} />
          <GuideMeta label="主な分野" value={`${categories.length}分類`} />
          <GuideMeta label="目的" value="学科と技能の橋渡し" />
        </div>
      </header>

      <section className="mt-3 panel p-4">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-base font-semibold text-slate-700">
            このページでできること
          </h2>
        </div>
        <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
          <li>学科と技能をつなぐガイド記事をまとめて読めます。</li>
          <li>要点、実技、欠陥判定、図鑑の各機能へすぐ移動できます。</li>
          <li>試験の全体像や失点しやすいポイントを、順番に整理して確認できます。</li>
        </ul>
      </section>

      <section className="mt-3 panel p-4">
        <div className="flex items-end justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">
              ALL GUIDES
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-800">
              ガイド一覧
            </h2>
          </div>
          <p className="text-sm text-slate-500">{guides.length}本</p>
        </div>
        <div className="mt-1 divide-y divide-slate-200">
        {guides.map((guide) => (
          <article key={guide.slug} className="py-4 first:pt-3 last:pb-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[12px] font-semibold text-slate-600">
                {getGuideCategoryLabel(guide.category)}
              </span>
              <span className="text-[12px] text-slate-500">{guide.readingTime}</span>
            </div>
            <h2 className="mt-3 text-xl font-bold text-slate-900">
              <Link href={`/guides/${guide.slug}`} className="hover:text-teal-700">
                {guide.title}
              </Link>
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              {guide.summary}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {guide.relatedLinks.slice(0, 2).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </article>
        ))}
        </div>
      </section>

      <section className="mt-3 panel p-4">
        <p className="text-sm leading-relaxed text-slate-600">
          このガイド集は、ホームのクイズや要点だけでは拾いにくい背景知識や考え方を補うために用意しています。
          {SITE_TITLE}
          の中で、学科と技能の関係を一段深く確認したいときに使ってください。
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}

function GuideMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-800">{value}</p>
    </div>
  );
}
