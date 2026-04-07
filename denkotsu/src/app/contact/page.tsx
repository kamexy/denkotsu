import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CONTACT_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `お問い合わせ | ${SITE_NAME}`,
  description:
    "デンコツへの不具合報告、改善提案、AdSense関連の確認事項の問い合わせ先です。",
};

export default function ContactPage() {
  return (
    <div className="pb-28 px-4 pt-3">
      <header className="panel px-4 py-5">
        <p className="text-xs font-semibold tracking-[0.18em] text-slate-500">
          CONTACT
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-teal-800">
          お問い合わせ
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          不具合、表示の崩れ、学習内容の誤り、機能改善の提案は GitHub Issues で受け付けます。
        </p>
      </header>

      <main className="space-y-3 pt-3">
        <section className="panel p-4">
          <h2 className="text-base font-semibold text-slate-800">連絡先</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            GitHub Issues を使うと、画面の状態や再現手順を残したまま共有できます。
            公開で困る内容は避け、必要な範囲の情報だけを書いてください。
          </p>
          <div className="mt-4">
            <a
              href={CONTACT_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
            >
              GitHub Issues を開く
            </a>
          </div>
        </section>

        <section className="panel p-4">
          <h2 className="text-base font-semibold text-slate-800">送ってほしい内容</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
            <li>発生した画面の名前</li>
            <li>何をしたときに起きたか</li>
            <li>期待した動作と実際の動作</li>
            <li>可能ならスクリーンショットや再現手順</li>
          </ul>
        </section>

        <section className="panel p-4">
          <h2 className="text-base font-semibold text-slate-800">関連ページ</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Link href="/about" className="rounded-xl border border-slate-200 bg-white/85 p-3 transition-colors hover:bg-white">
              <p className="text-sm font-semibold text-slate-800">このサイトについて</p>
              <p className="mt-1 text-xs text-slate-500">運営目的と学習方針を確認</p>
            </Link>
            <Link href="/privacy" className="rounded-xl border border-slate-200 bg-white/85 p-3 transition-colors hover:bg-white">
              <p className="text-sm font-semibold text-slate-800">プライバシー</p>
              <p className="mt-1 text-xs text-slate-500">保存データと外部サービスの説明</p>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
