import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `利用規約 | ${SITE_NAME}`,
  description:
    "デンコツの利用条件、免責事項、著作権、外部サービス利用に関する規約をまとめたページです。",
};

export default function TermsPage() {
  return (
    <div className="pb-28 px-4 pt-3">
      <header className="panel px-4 py-5">
        <p className="text-xs font-semibold tracking-[0.18em] text-slate-500">
          TERMS
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-teal-800">
          利用規約
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          このページは、デンコツを利用する際の基本条件をまとめたものです。
        </p>
      </header>

      <main className="space-y-3 pt-3">
        <section className="panel p-4">
          <h2 className="text-base font-semibold text-slate-800">利用条件</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
            <li>本サイトは無料で利用できます。</li>
            <li>ログインは不要ですが、将来の任意同期や外部サービス利用は別途条件が適用されます。</li>
            <li>学習データや表示内容は、端末やブラウザの状態によって変わる場合があります。</li>
          </ul>
        </section>

        <section className="panel p-4">
          <h2 className="text-base font-semibold text-slate-800">免責</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            デンコツの掲載内容は、試験対策を支援する目的で提供しています。
            正確性には配慮していますが、試験実施機関の公式情報を必ず優先してください。
            掲載内容の利用によって生じた損害について、運営者は責任を負いません。
          </p>
        </section>

        <section className="panel p-4">
          <h2 className="text-base font-semibold text-slate-800">著作権とデータ</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            本サイトの文章、画面設計、データ構成は運営側の管理対象です。
            学習データはブラウザ内保存を基本とし、同期機能を使う場合のみ外部サービスを経由します。
          </p>
        </section>

        <section className="panel p-4">
          <h2 className="text-base font-semibold text-slate-800">外部サービス</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Google Analytics、Google AdSense、Amazon アソシエイトなどの外部サービスを利用する場合があります。
            各サービスの利用条件・プライバシーポリシーも合わせて確認してください。
          </p>
          <div className="mt-3">
            <Link href="/privacy" className="text-sm text-teal-700 underline-offset-4 hover:underline">
              プライバシーポリシーを見る
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
