"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "クイズ", icon: "quiz" },
  { href: "/learn", label: "要点", icon: "learn" },
  { href: "/stats", label: "成績", icon: "stats" },
  { href: "/settings", label: "設定", icon: "settings" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)]">
      <div className="mx-auto max-w-[480px] panel px-1 py-1.5">
        <div className="flex">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex-1 flex flex-col items-center rounded-xl py-2.5 transition-all ${
                  active
                    ? "bg-teal-700 text-white shadow-sm"
                    : "text-slate-500 hover:bg-white/70"
                }`}
              >
                <TabIcon name={tab.icon} active={active} />
                <span className="text-[11px] mt-1 font-semibold tracking-wide">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function TabIcon({
  name,
  active,
}: {
  name: (typeof tabs)[number]["icon"];
  active: boolean;
}) {
  const className = `h-4 w-4 ${active ? "text-white" : "text-teal-800"}`;
  if (name === "quiz") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <path
          d="M13.2 2L5 13.1h5.6L9.8 22 18 10.9h-5.6L13.2 2z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "learn") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <path
          d="M4 5.8c0-1 0.8-1.8 1.8-1.8H12v15H5.8A1.8 1.8 0 0 1 4 17.2V5.8zM12 4h6.2c1 0 1.8 0.8 1.8 1.8v11.4c0 1-0.8 1.8-1.8 1.8H12V4z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "stats") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <path
          d="M5 18V11M12 18V7M19 18V4"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19.4 13.5a1 1 0 0 0 .2-1.1l-.6-1.1.6-1.1a1 1 0 0 0-.2-1.1l-1-.9.1-1.2a1 1 0 0 0-.7-1l-1.2-.4-.5-1.1a1 1 0 0 0-1-.6h-1.3l-.9-.9a1 1 0 0 0-1.2 0l-.9.9H9.6a1 1 0 0 0-1 .6l-.5 1.1-1.2.4a1 1 0 0 0-.7 1l.1 1.2-1 .9a1 1 0 0 0-.2 1.1l.6 1.1-.6 1.1a1 1 0 0 0 .2 1.1l1 .9-.1 1.2a1 1 0 0 0 .7 1l1.2.4.5 1.1a1 1 0 0 0 1 .6h1.3l.9.9a1 1 0 0 0 1.2 0l.9-.9h1.3a1 1 0 0 0 1-.6l.5-1.1 1.2-.4a1 1 0 0 0 .7-1l-.1-1.2 1-.9z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
