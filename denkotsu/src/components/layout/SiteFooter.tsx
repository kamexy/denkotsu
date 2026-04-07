import Link from "next/link";
import { CONTACT_URL, SITE_NAME } from "@/lib/site";

const primaryLinks = [
  { href: "/", label: "ホーム" },
  { href: "/learn", label: "要点" },
  { href: "/practical", label: "実技" },
  { href: "/collection", label: "図鑑" },
] as const;

const policyLinks = [
  { href: "/about", label: "このサイトについて" },
  { href: "/privacy", label: "プライバシー" },
  { href: "/terms", label: "利用規約" },
  { href: "/contact", label: "お問い合わせ" },
] as const;

export function SiteFooter() {
  return (
    <footer className="px-4 pb-24 pt-8">
      <div className="border-t border-slate-200/80 px-1 pt-5 text-slate-600">
        <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
          {SITE_NAME}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          第二種電気工事士の学科・技能を、無料で、スマホ中心に学べるサイトです。
          学習導線と運営情報をまとめて確認できるようにしています。
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">主なページ</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {primaryLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-teal-700 underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-700">運営情報</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {policyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-teal-700 underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={CONTACT_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-700 underline-offset-4 hover:underline"
                >
                  GitHub Issues
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          学習データは端末内保存を基本とし、同期は任意です。広告や計測は、必要最小限の範囲で利用しています。
        </p>
      </div>
    </footer>
  );
}
