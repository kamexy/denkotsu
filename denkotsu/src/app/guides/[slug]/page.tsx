import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getGuideBySlug,
  getGuideSlugs,
  getGuideCategoryLabel,
} from "@/lib/guides";
import { getAbsoluteUrl, SITE_NAME } from "@/lib/site";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) {
    return {};
  }
  return {
    title: guide.title,
    description: guide.summary,
    alternates: {
      canonical: getAbsoluteUrl(`/guides/${guide.slug}`),
    },
  } satisfies Metadata;
}

export default async function GuideDetailPage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  return (
    <main className="pb-28 px-4 pt-3">
      <article className="panel px-5 py-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[12px] font-semibold text-slate-600">
            {getGuideCategoryLabel(guide.category)}
          </span>
          <span className="text-[12px] text-slate-500">{guide.readingTime}</span>
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold text-teal-800">
          {guide.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600">
          {guide.summary}
        </p>

        <div className="mt-5 divide-y divide-slate-200 border-t border-slate-200">
          {guide.sections.map((section) => (
            <section key={section.heading} className="py-5">
              <h2 className="text-xl font-semibold text-slate-800">
                {section.heading}
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-teal-600 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </article>

      <section className="mt-3 panel p-4">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-base font-semibold text-slate-700">関連導線</h2>
        </div>
        <div className="mt-1 divide-y divide-slate-200">
          {guide.relatedLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-4 first:pt-3 last:pb-1"
            >
              <p className="text-sm font-semibold text-slate-800">{link.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-3 panel p-4">
        <p className="text-sm leading-relaxed text-slate-600">
          {SITE_NAME} の記事は、アプリ機能と切り離さずに読めることを重視しています。
          学習の背景を理解したあと、ホームや要点、技能試験へ戻ると定着しやすくなります。
        </p>
      </section>

    </main>
  );
}
