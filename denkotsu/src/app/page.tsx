import Link from "next/link";
import type { Metadata } from "next";
import { HomeQuizClient } from "@/components/home/HomeQuizClient";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getAllGuides } from "@/lib/guides";
import { getAllQuestions } from "@/lib/questions";
import { getAllKeyPoints } from "@/lib/key-points";
import {
  getPracticalDefectQuestions,
  getPracticalWiringProblems,
} from "@/lib/practical";
import { SITE_DESCRIPTION, SITE_NAME, getAbsoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: getAbsoluteUrl("/"),
  },
};

const strengths = [
  {
    title: "誤答復習を自動化",
    body:
      "間違えた問題や忘れやすい問題を優先して出題します。学習計画を自分で立てなくても、開けば次に解くべき問題から始まります。",
  },
  {
    title: "図と実技を一つに集約",
    body:
      "学科の4択だけでなく、画像タップ、正誤問題、複線図ステップ練習、欠陥判定クイズまで同じ導線で学べます。",
  },
  {
    title: "スキマ時間前提の設計",
    body:
      "1問10秒から始められるため、通勤中や休憩中でも続けやすい構成です。ストリークで煽らず、必要な時だけ戻れます。",
  },
];

const learningFlow = [
  {
    title: "1. クイズで現在地を把握",
    body: "最初はホームのクイズで正答率と合格力を確認します。",
    href: "/",
    label: "クイズを始める",
  },
  {
    title: "2. 要点で弱点を補強",
    body: "カテゴリ別の要点と個別ページで、頻出論点を短時間で復習します。",
    href: "/key-points",
    label: "要点ページを見る",
  },
  {
    title: "3. 技能試験対策へ接続",
    body: "複線図練習、欠陥判定、タイムライン練習で技能試験の段取りを固めます。",
    href: "/practical",
    label: "技能試験対策を見る",
  },
];

const faqs = [
  {
    question: "このサイトだけで何が学べますか？",
    answer:
      "第二種電気工事士の学科試験で頻出の問題演習、要点整理、画像タップ問題、技能試験向けの複線図と欠陥判定まで学べます。参考書の補助だけでなく、単独でも反復学習しやすい構成です。",
  },
  {
    question: "ログインしなくても使えますか？",
    answer:
      "使えます。学習履歴は端末の IndexedDB に保存され、任意で Cloudflare D1 ベースの同期機能も使えます。",
  },
  {
    question: "どんな人向けですか？",
    answer:
      "参考書が続きにくい人、通勤や休憩時間で少しずつ学びたい人、学科と技能の切り替えを一つのサイトで済ませたい人向けです。",
  },
];

export default function HomePage() {
  const questionCount = getAllQuestions().length;
  const keyPointCount = getAllKeyPoints().length;
  const wiringCount = getPracticalWiringProblems().length;
  const defectCount = getPracticalDefectQuestions().length;
  const featuredGuides = getAllGuides().slice(0, 6);

  return (
    <div className="pb-28">
      <header className="px-4 pt-3">
        <div className="panel px-5 py-6">
          <p className="text-[12px] font-semibold tracking-[0.18em] text-slate-500">
            SECOND ELECTRICIAN EXAM
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-teal-800">
            {SITE_NAME}で第二種電気工事士の学科・技能をまとめて学ぶ
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-8 text-slate-600">
            {SITE_DESCRIPTION}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="#daily-quiz"
              className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
            >
              すぐに1問解く
            </Link>
            <Link
              href="/guides"
              className="rounded-xl border border-slate-200 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-white"
            >
              勉強ガイドを読む
            </Link>
            <Link
              href="/about"
              className="rounded-xl border border-slate-200 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-white"
            >
              サイト概要
            </Link>
          </div>
          <dl className="mt-6 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-4">
            <HeroMetric label="学科問題" value={`${questionCount}問`} />
            <HeroMetric label="要点解説" value={`${keyPointCount}件`} />
            <HeroMetric label="候補問題" value={`${wiringCount}問`} />
            <HeroMetric label="欠陥判定" value={`${defectCount}問`} />
          </dl>
        </div>
      </header>

      <main className="space-y-3 px-4 pt-3">
        <section className="panel p-4">
          <div className="flex items-end justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">
                WHY THIS SITE
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-800">
                このサイトの強み
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-slate-500">
              参考書の補助ではなく、反復学習の中心として使える構造にしています。
            </p>
          </div>
          <div className="mt-1 divide-y divide-slate-200">
            {strengths.map((item) => (
              <article key={item.title} className="py-4 first:pt-3 last:pb-1">
                <h3 className="text-base font-semibold text-slate-800">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel p-4">
          <div className="flex items-end justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">
                LEARNING FLOW
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-800">
                学習の進め方
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                学科から技能まで、迷わず進められる導線を用意しています。
              </p>
            </div>
            <Link href="/guides" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
              すべてのガイドへ
            </Link>
          </div>
          <div className="mt-1 divide-y divide-slate-200">
            {learningFlow.map((item) => (
              <article key={item.title} className="py-4 first:pt-3 last:pb-1">
                <h3 className="text-base font-semibold text-slate-800">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                  {item.body}
                </p>
                <Link
                  href={item.href}
                  className="mt-3 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
                >
                  {item.label}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="panel p-4">
          <div className="flex items-end justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">
                CONTENT MAP
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-800">
                主要コンテンツ
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-slate-500">
              4択問題だけで終わらず、要点・図鑑・技能練習まで横断できます。
            </p>
          </div>
          <div className="mt-1 divide-y divide-slate-200">
            <ContentRow
              href="/learn"
              label="要点チェック"
              title="頻出論点を短時間で確認"
              body="配線図、工事方法、電気理論などをカテゴリ別に整理しています。"
            />
            <ContentRow
              href="/practical"
              label="技能試験対策"
              title="複線図・欠陥判定・40分配分"
              body="候補13問のステップ練習と欠陥判定クイズで、実技の定着を進めます。"
            />
            <ContentRow
              href="/collection"
              label="図鑑"
              title="器具・材料・工具を覚える"
              body="出題対象と現場の基本アイテムを、名前と特徴と一緒に覚えられます。"
            />
            <ContentRow
              href="/key-points"
              label="要点一覧"
              title="1テーマずつ読み返せる"
              body="1テーマずつ開けるので、復習したい要点をあとから探しやすくしています。"
            />
          </div>
        </section>

        <section className="panel p-4">
          <div className="flex items-end justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">
                READING
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-800">
                まず読むべきガイド
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                アプリの使い方だけでなく、試験の全体像や失点しやすいポイントまで記事で確認できます。
              </p>
            </div>
            <Link href="/guides" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
              すべてのガイドへ
            </Link>
          </div>
          <div className="mt-1 divide-y divide-slate-200">
            {featuredGuides.map((guide) => (
              <article key={guide.slug} className="py-4 first:pt-3 last:pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[12px] font-semibold text-slate-600">
                    {guide.readingTime}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-800">
                  <Link href={`/guides/${guide.slug}`} className="hover:text-teal-700">
                    {guide.title}
                  </Link>
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                  {guide.summary}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel p-4">
          <div className="border-b border-slate-200 pb-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">
              FAQ
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-800">
              よくある質問
            </h2>
          </div>
          <div className="mt-1 divide-y divide-slate-200">
            {faqs.map((item) => (
              <article key={item.question} className="py-4 first:pt-3 last:pb-1">
                <h3 className="text-base font-semibold text-slate-800">
                  {item.question}
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="daily-quiz" className="pt-1">
          <div className="mb-3 panel p-4">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">
              DAILY QUIZ
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-800">
              今日の1問
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              1問ずつ気軽に取り組める確認クイズです。スキマ時間に解いて、学科と技能の理解度チェックに使えます。
            </p>
          </div>
          <HomeQuizClient />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function HeroMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 font-display text-2xl font-bold text-teal-800">
        {value}
      </dd>
    </div>
  );
}

function ContentRow({
  href,
  label,
  title,
  body,
}: {
  href: string;
  label: string;
  title: string;
  body: string;
}) {
  return (
    <Link href={href} className="block py-4 first:pt-3 last:pb-1">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-teal-700">{label}</p>
          <p className="mt-1 text-lg font-semibold text-slate-800">{title}</p>
        </div>
        <span className="text-sm font-semibold text-slate-400">→</span>
      </div>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{body}</p>
    </Link>
  );
}
