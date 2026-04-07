import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from "@/lib/site";

export const metadata: Metadata = {
  title: `このサイトについて | ${SITE_NAME}`,
  description:
    "デンコツの目的、学習方針、対応範囲、運営方針をまとめたページです。",
};

const highlights = [
  "学科は1問10秒前後の短時間学習に寄せる",
  "技能試験は複線図、欠陥判定、タイムラインで分解する",
  "学習履歴は端末内保存を基本にし、必要に応じて同期する",
  "ログイン不要で、開いたらすぐ学習を始められる",
] as const;

export default function AboutPage() {
  return (
    <div className="pb-28 px-4 pt-3">
      <header className="panel px-4 py-5">
        <p className="text-xs font-semibold tracking-[0.18em] text-slate-500">
          ABOUT
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-teal-800">
          {SITE_TITLE}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {SITE_DESCRIPTION}
        </p>
      </header>

      <main className="space-y-3 pt-3">
        <section className="panel p-4">
          <h2 className="text-base font-semibold text-slate-800">このサイトの目的</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            デンコツは、第二種電気工事士の学習を「続けやすい形」に寄せた無料サイトです。
            参考書を読み切る前に止まってしまう人でも、スマホで数分触るだけで学習が進む設計を目指しています。
          </p>
        </section>

        <section className="panel p-4">
          <h2 className="text-base font-semibold text-slate-800">学習方針</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
            {highlights.map((item) => (
              <li key={item} className="rounded-lg bg-slate-50/80 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel p-4">
          <h2 className="text-base font-semibold text-slate-800">主な機能</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Feature href="/learn" title="要点チェック" description="分野別の頻出ポイントを短く確認できます。" />
            <Feature href="/practical" title="技能試験対策" description="複線図、欠陥判定、手順確認をまとめています。" />
            <Feature href="/collection" title="図鑑" description="器具や材料を集めながら学べます。" />
            <Feature href="/stats" title="学習のきろく" description="合格力や復習状況を確認できます。" />
          </div>
        </section>

        <section className="panel p-4">
          <h2 className="text-base font-semibold text-slate-800">運営について</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            学習データは端末内保存を基本とし、任意でクラウド同期を使えます。
            広告やアフィリエイトはサイト維持のために利用しますが、学習導線を妨げない範囲に抑えます。
          </p>
          <div className="mt-3">
            <Link href="/privacy" className="text-sm text-teal-700 underline-offset-4 hover:underline">
              プライバシーの詳細を見る
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Feature({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-white/85 p-3 transition-colors hover:bg-white"
    >
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
    </Link>
  );
}
