import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  getPracticalWiringProblems,
  type PracticalWiringProblem,
} from "@/lib/practical";
import { SITE_NAME, getAbsoluteUrl } from "@/lib/site";

function getProblem(id: number): PracticalWiringProblem | undefined {
  return getPracticalWiringProblems().find((item) => item.id === id);
}

export function generateStaticParams() {
  return getPracticalWiringProblems().map((problem) => ({
    id: String(problem.id),
  }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  return params.then(({ id }) => {
    const problem = getProblem(Number(id));
    if (!problem) {
      return {
        title: "候補問題が見つかりません",
      };
    }

    const title = `技能試験 候補問題No.${problem.id} ${problem.title}`;
    const description = `第二種電気工事士の技能試験 候補問題No.${problem.id}。${problem.focus}を中心に、複線図と作業手順を5ステップで確認できます。`;

    return {
      title,
      description,
      alternates: {
        canonical: getAbsoluteUrl(`/practical/wiring/${problem.id}`),
      },
      openGraph: {
        title: `${title} | ${SITE_NAME}`,
        description,
        url: getAbsoluteUrl(`/practical/wiring/${problem.id}`),
      },
    };
  });
}

export default async function PracticalWiringDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const problem = getProblem(Number(id));
  if (!problem) notFound();

  const allProblems = getPracticalWiringProblems();
  const previous = allProblems.find((item) => item.id === problem.id - 1);
  const next = allProblems.find((item) => item.id === problem.id + 1);

  return (
    <div className="pb-28">
      <header className="px-4 pt-3">
        <div className="panel p-5">
          <p className="text-sm font-semibold tracking-wide text-teal-700">
            技能試験 候補問題ガイド
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-teal-800">
            候補問題 No.{problem.id} {problem.title}
          </h1>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {problem.focus} を軸に、複線図を組み立てる順番と見落としやすいポイントを確認できます。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/practical/wiring" className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
              ステップ練習へ戻る
            </Link>
            <Link href="/practical" className="rounded-xl border border-slate-200 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white">
              実技トップ
            </Link>
          </div>
        </div>
      </header>

      <main className="space-y-3 px-4 pt-3">
        <section className="panel p-4">
          <h2 className="text-lg font-semibold text-slate-800">単線図</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--diagram-border)] bg-[var(--diagram-surface)] p-3">
            <Image
              src={problem.singleLineImage}
              alt={`候補問題No.${problem.id} ${problem.title} の単線図`}
              width={1200}
              height={900}
              unoptimized
              className="mx-auto h-auto max-h-[420px] w-full object-contain"
            />
          </div>
        </section>

        <section className="panel p-4">
          <h2 className="text-lg font-semibold text-slate-800">作業の流れ</h2>
          <ol className="mt-3 space-y-2">
            {problem.steps.map((step, index) => (
              <li key={step} className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <p className="text-sm font-semibold text-teal-700">STEP {index + 1}</p>
                <p className="mt-2 text-sm leading-7 text-slate-700">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="panel p-4">
          <h2 className="text-lg font-semibold text-slate-800">受験メモ</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {problem.tip}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            候補問題の練習では、最初に白線先行で配線全体を把握し、その後にスイッチ側の色線を整理すると手戻りが減ります。完成後は極性、結線忘れ、差込量、圧着サイズをまとめて確認してください。
          </p>
        </section>

        <section className="panel p-4">
          <h2 className="text-lg font-semibold text-slate-800">関連する練習</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Link href="/practical/defects" className="rounded-2xl border border-slate-200 bg-white/80 p-4 hover:bg-white">
              <p className="text-sm font-semibold text-teal-700">欠陥判定クイズ</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">完成後の見直しで落としやすいポイントを確認します。</p>
            </Link>
            <Link href="/practical/timeline" className="rounded-2xl border border-slate-200 bg-white/80 p-4 hover:bg-white">
              <p className="text-sm font-semibold text-teal-700">40分タイムライン</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">当日の時間配分を身体で覚えるための練習です。</p>
            </Link>
          </div>
        </section>

        <section className="grid gap-2 sm:grid-cols-2">
          {previous ? (
            <Link href={`/practical/wiring/${previous.id}`} className="panel p-4 hover:bg-white/70">
              <p className="text-sm font-semibold text-slate-500">前の候補問題</p>
              <p className="mt-2 text-base font-semibold text-slate-800">No.{previous.id} {previous.title}</p>
            </Link>
          ) : (
            <div className="panel p-4 opacity-60">
              <p className="text-sm font-semibold text-slate-500">前の候補問題</p>
              <p className="mt-2 text-base font-semibold text-slate-700">最初の候補問題です</p>
            </div>
          )}
          {next ? (
            <Link href={`/practical/wiring/${next.id}`} className="panel p-4 hover:bg-white/70">
              <p className="text-sm font-semibold text-slate-500">次の候補問題</p>
              <p className="mt-2 text-base font-semibold text-slate-800">No.{next.id} {next.title}</p>
            </Link>
          ) : (
            <div className="panel p-4 opacity-60">
              <p className="text-sm font-semibold text-slate-500">次の候補問題</p>
              <p className="mt-2 text-base font-semibold text-slate-700">最後の候補問題です</p>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
