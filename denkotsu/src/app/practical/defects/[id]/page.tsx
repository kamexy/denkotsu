import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  getPracticalDefectQuestions,
  type PracticalDefectQuestion,
} from "@/lib/practical";
import { SITE_NAME, getAbsoluteUrl } from "@/lib/site";

function getQuestion(id: string): PracticalDefectQuestion | undefined {
  return getPracticalDefectQuestions().find((item) => item.id === id);
}

export function generateStaticParams() {
  return getPracticalDefectQuestions().map((question) => ({
    id: question.id,
  }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  return params.then(({ id }) => {
    const question = getQuestion(id);
    if (!question) {
      return { title: "欠陥判定ページが見つかりません" };
    }

    const title = `${question.title}の欠陥判定`;
    const description = question.hasDefect
      ? `欠陥種別: ${question.defectType ?? "欠陥あり"}。${question.defectDescription ?? question.judgingCriteria}`
      : `合格施工の例です。判定基準: ${question.judgingCriteria}`;

    return {
      title,
      description,
      alternates: {
        canonical: getAbsoluteUrl(`/practical/defects/${question.id}`),
      },
      openGraph: {
        title: `${title} | ${SITE_NAME}`,
        description,
        url: getAbsoluteUrl(`/practical/defects/${question.id}`),
      },
    };
  });
}

export default async function PracticalDefectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const question = getQuestion(id);
  if (!question) notFound();

  return (
    <div className="pb-28">
      <header className="px-4 pt-3">
        <div className="panel p-5">
          <p className="text-sm font-semibold tracking-wide text-teal-700">
            技能試験 欠陥判定ガイド
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-teal-800">
            {question.title}
          </h1>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {question.hasDefect
              ? "欠陥がある施工例です。どこが落点になるかを画像と基準から確認できます。"
              : "合格施工の例です。見直しで何を確認すべきかを整理できます。"}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/practical/defects" className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
              欠陥判定クイズへ戻る
            </Link>
            <Link href="/practical" className="rounded-xl border border-slate-200 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white">
              実技トップ
            </Link>
          </div>
        </div>
      </header>

      <main className="space-y-3 px-4 pt-3">
        {question.image && (
          <section className="panel p-4">
            <h2 className="text-lg font-semibold text-slate-800">施工図</h2>
            <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--diagram-border)] bg-[var(--diagram-surface)] p-3">
              <Image
                src={question.image}
                alt={question.title}
                width={1200}
                height={900}
                unoptimized
                className="mx-auto h-auto max-h-[480px] w-full object-contain"
              />
            </div>
          </section>
        )}

        <section className="panel p-4">
          <h2 className="text-lg font-semibold text-slate-800">判定</h2>
          <div className={`mt-3 rounded-2xl border p-4 ${question.hasDefect ? "border-rose-200 bg-rose-50/80" : "border-emerald-200 bg-emerald-50/80"}`}>
            <p className={`text-base font-semibold ${question.hasDefect ? "text-rose-700" : "text-emerald-700"}`}>
              {question.hasDefect ? "欠陥あり" : "合格施工"}
            </p>
            {question.defectType && (
              <p className="mt-2 text-sm leading-6 text-slate-700">欠陥種別: {question.defectType}</p>
            )}
            {question.defectDescription && (
              <p className="mt-2 text-sm leading-7 text-slate-600">{question.defectDescription}</p>
            )}
          </div>
        </section>

        <section className="panel p-4">
          <h2 className="text-lg font-semibold text-slate-800">判定基準</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{question.judgingCriteria}</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            技能試験では、極性、差込量、圧着サイズ、被覆剥きすぎ、接続忘れのいずれも失点要因になります。写真を見るだけでなく、完成後の見直し手順として暗記しておくのが有効です。
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
