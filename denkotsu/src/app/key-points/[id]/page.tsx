import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getAllKeyPoints, getKeyPointById } from "@/lib/key-points";
import { getAbsoluteUrl, SITE_NAME, SITE_TITLE } from "@/lib/site";
import { ALL_CATEGORIES, CATEGORY_LABELS, type Category } from "@/types";

type PageParams = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return getAllKeyPoints().map((keyPoint) => ({
    id: keyPoint.id,
  }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { id } = await params;
  const keyPoint = getKeyPointById(id);

  if (!keyPoint) {
    return {
      title: `要点 | ${SITE_NAME}`,
    };
  }

  return {
    title: `${keyPoint.title} | 要点一覧`,
    description: `${CATEGORY_LABELS[keyPoint.category]}の要点「${keyPoint.title}」を、公式・本文・例つきで確認できます。`,
    alternates: {
      canonical: getAbsoluteUrl(`/key-points/${keyPoint.id}`),
    },
    openGraph: {
      title: `${keyPoint.title} | ${SITE_TITLE}`,
      description: `${CATEGORY_LABELS[keyPoint.category]}の要点を、公式・本文・例つきで確認できます。`,
      url: getAbsoluteUrl(`/key-points/${keyPoint.id}`),
      siteName: SITE_NAME,
      type: "article",
    },
  };
}

export default async function KeyPointDetailPage({ params }: PageParams) {
  const { id } = await params;
  const keyPoint = getKeyPointById(id);

  if (!keyPoint) {
    notFound();
  }

  const sameCategoryPoints = getAllKeyPoints().filter(
    (item) => item.category === keyPoint.category && item.id !== keyPoint.id
  );
  const categoryIndex = ALL_CATEGORIES.indexOf(keyPoint.category);
  const adjacentCategories = [
    ALL_CATEGORIES[categoryIndex - 1],
    ALL_CATEGORIES[categoryIndex + 1],
  ].filter(Boolean) as Category[];

  return (
    <main className="pb-28 px-4 pt-3">
      <nav className="text-sm text-slate-500">
        <Link href="/key-points" className="hover:text-slate-700">
          要点一覧
        </Link>
        <span className="mx-2">/</span>
        <span>{CATEGORY_LABELS[keyPoint.category]}</span>
      </nav>

      <header className="mt-2 panel px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
              {CATEGORY_LABELS[keyPoint.category]}
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold text-teal-800">
              {keyPoint.title}
            </h1>
          </div>
          <Link
            href="/key-points"
            className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-white"
          >
            一覧へ戻る
          </Link>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          試験でそのまま問われやすい考え方を、公式・本文・例の順で整理しています。
        </p>
      </header>

      {keyPoint.formula ? (
        <section className="mt-3 panel p-4">
          <h2 className="text-base font-semibold text-slate-800">公式</h2>
          <div className="mt-3 rounded-2xl bg-teal-700 px-4 py-4 text-center">
            <p className="font-display text-2xl font-bold tracking-wide text-white">
              {keyPoint.formula}
            </p>
          </div>
        </section>
      ) : null}

      <section className="mt-3 panel p-4">
        <h2 className="text-base font-semibold text-slate-800">要点の整理</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">{keyPoint.body}</p>
      </section>

      {keyPoint.example ? (
        <section className="mt-3 panel p-4">
          <h2 className="text-base font-semibold text-slate-800">例</h2>
          <p className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900">
            {keyPoint.example}
          </p>
        </section>
      ) : null}

      {keyPoint.image ? (
        <section className="mt-3 panel p-4">
          <h2 className="text-base font-semibold text-slate-800">図で確認</h2>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-[color:var(--diagram-surface)] p-4">
            <Image
              src={keyPoint.image}
              alt={keyPoint.title}
              width={960}
              height={540}
              className="mx-auto h-auto max-h-[320px] w-full object-contain"
            />
          </div>
        </section>
      ) : null}

      <section className="mt-3 panel p-4">
        <h2 className="text-base font-semibold text-slate-800">同じ分野の要点</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {sameCategoryPoints.map((item) => (
            <Link
              key={item.id}
              href={`/key-points/${item.id}`}
              className="rounded-2xl border border-slate-200 bg-white/85 p-3 transition-colors hover:bg-white"
            >
              <p className="text-[11px] font-semibold tracking-wide text-slate-500">
                {CATEGORY_LABELS[item.category]}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{item.title}</p>
            </Link>
          ))}
          {sameCategoryPoints.length === 0 ? (
            <p className="text-sm text-slate-500">
              この分野の他の要点はありません。
            </p>
          ) : null}
        </div>
      </section>

      <section className="mt-3 panel p-4">
        <h2 className="text-base font-semibold text-slate-800">関連カテゴリへ</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {adjacentCategories.map((category) => (
            <Link
              key={category}
              href={`/key-points#${category}`}
              className="rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-white"
            >
              {CATEGORY_LABELS[category]}
            </Link>
          ))}
          <Link
            href="/learn"
            className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-100"
          >
            要点チェックへ
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
