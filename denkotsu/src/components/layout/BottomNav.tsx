"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "クイズ", icon: "⚡" },
  { href: "/learn", label: "要点", icon: "📖" },
  { href: "/stats", label: "成績", icon: "📊" },
  { href: "/settings", label: "設定", icon: "⚙️" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-[480px] flex">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center py-3 transition-colors ${
                active ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span className="text-[11px] mt-1 font-medium">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
