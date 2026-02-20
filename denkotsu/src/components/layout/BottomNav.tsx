"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "クイズ", icon: "quiz" },
  { href: "/learn", label: "要点", icon: "learn" },
  { href: "/stats", label: "成績", icon: "stats" },
  { href: "/collection", label: "図鑑", icon: "collection" },
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
                <span className="text-[13px] mt-1 font-semibold tracking-wide">
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
  const className = `h-6 w-6 ${active ? "text-white" : "text-teal-800"}`;
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
  if (name === "collection") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <path
          d="M12 3.2l2.4 4.9 5.4.8-3.9 3.8.9 5.3L12 15.5 7.2 18l.9-5.3L4.2 8.9l5.4-.8L12 3.2z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="7.1" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M12 2.8v2.3M12 18.9v2.3M2.8 12h2.3M18.9 12h2.3M5.5 5.5l1.6 1.6M16.9 16.9l1.6 1.6M5.5 18.5l1.6-1.6M16.9 7.1l1.6-1.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
