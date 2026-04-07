import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `プライバシー | ${SITE_NAME}`,
  description:
    "デンコツで扱うデータ、ローカル保存、Cloudflare同期、Google Analytics、AdSense、アフィリエイトの取り扱いを説明します。",
};

export default function PrivacyPage() {
  return (
    <div className="pb-28 px-4 pt-3">
      <header className="panel px-4 py-5">
        <p className="text-xs font-semibold tracking-[0.18em] text-slate-500">
          PRIVACY
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-teal-800">
          プライバシーポリシー
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          このページでは、デンコツが取り扱うデータの種類と、計測・広告・同期の扱いを説明します。
        </p>
      </header>

      <main className="space-y-3 pt-3">
        <section className="panel p-4">
          <h2 className="text-base font-semibold text-slate-800">保存するデータ</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
            <li>学習履歴、正誤、解答時間、合格力推定値を端末内に保存します。</li>
            <li>設定値、図鑑の取得状況、実技の進捗も端末内保存を基本とします。</li>
            <li>クラウド同期を使う場合のみ、同期IDと学習スナップショットを送受信します。</li>
          </ul>
        </section>

        <section className="panel p-4">
          <h2 className="text-base font-semibold text-slate-800">計測と広告</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
            <p>
              Google Analytics は、匿名化設定を前提に利用し、ページ閲覧や広告導線の改善に使います。
            </p>
            <p>
              Google AdSense は、広告配信と収益化のために利用します。広告の表示位置や頻度は、学習体験を損なわない範囲に抑えます。
            </p>
            <p>
              Amazon アソシエイトのリンクは、外部教材や関連工具の紹介のために設置することがあります。
              クリック先は Amazon のサイトであり、購入は Amazon 側の条件に従います。
            </p>
          </div>
        </section>

        <section className="panel p-4">
          <h2 className="text-base font-semibold text-slate-800">同期について</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Cloudflare 経由の同期は任意機能です。同期コードを共有した端末間でのみデータを移せる設計にしています。
            同期を使わない場合、学習データは端末内に閉じます。
          </p>
        </section>

        <section className="panel p-4">
          <h2 className="text-base font-semibold text-slate-800">外部リンク</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            GitHub Issues への問い合わせは、運営上の確認や不具合報告のために使います。
          </p>
          <div className="mt-3">
            <Link href="/contact" className="text-sm text-teal-700 underline-offset-4 hover:underline">
              お問い合わせページを見る
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
