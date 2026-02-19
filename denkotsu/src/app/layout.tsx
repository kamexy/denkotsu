import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { ServiceWorkerRegistrar } from "@/components/layout/ServiceWorkerRegistrar";
import { BottomNav } from "@/components/layout/BottomNav";
import { CloudSyncBootstrap } from "@/components/layout/CloudSyncBootstrap";
import { ThemeBootstrap } from "@/components/layout/ThemeBootstrap";
import {
  getAdsenseClientId,
  getAdsenseWarnings,
  isAdsenseScriptEnabled,
} from "@/lib/ads";
import { getMonetizationTelemetryWarnings } from "@/lib/telemetry";

const syncApiBase = (process.env.NEXT_PUBLIC_SYNC_API_BASE ?? "").trim();
let syncApiOrigin = "";
if (syncApiBase) {
  try {
    syncApiOrigin = new URL(syncApiBase).origin;
  } catch {
    syncApiOrigin = "";
  }
}

const shouldLoadAdsenseScript = isAdsenseScriptEnabled();
const adsenseClientId = getAdsenseClientId();
const adsenseWarnings = getAdsenseWarnings();
const telemetryWarnings = getMonetizationTelemetryWarnings();

if (adsenseWarnings.length > 0) {
  console.warn(`[ads] ${adsenseWarnings.join(" / ")}`);
}

if (telemetryWarnings.length > 0) {
  console.warn(`[telemetry] ${telemetryWarnings.join(" / ")}`);
}

const telemetryEndpoint = (
  process.env.NEXT_PUBLIC_MONETIZATION_TELEMETRY_ENDPOINT ?? ""
).trim();
let telemetryOrigin = "";
if (telemetryEndpoint) {
  try {
    const parsed = new URL(telemetryEndpoint);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      telemetryOrigin = parsed.origin;
    }
  } catch {
    telemetryOrigin = "";
  }
}

const scriptSrcTokens = ["'self'", "'unsafe-inline'", "'unsafe-eval'"];
const styleSrcTokens = ["'self'", "'unsafe-inline'"];
const imgSrcTokens = ["'self'", "data:"];
const connectSrcTokens = ["'self'", syncApiOrigin || "https://*.workers.dev"];
const frameSrcTokens = ["'self'"];

if (telemetryOrigin) {
  connectSrcTokens.push(telemetryOrigin);
}

if (shouldLoadAdsenseScript) {
  scriptSrcTokens.push("https://pagead2.googlesyndication.com");
  imgSrcTokens.push(
    "https://pagead2.googlesyndication.com",
    "https://tpc.googlesyndication.com",
    "https://googleads.g.doubleclick.net",
    "https://*.doubleclick.net",
    "https://*.googleusercontent.com"
  );
  connectSrcTokens.push(
    "https://pagead2.googlesyndication.com",
    "https://tpc.googlesyndication.com",
    "https://googleads.g.doubleclick.net",
    "https://*.doubleclick.net"
  );
  frameSrcTokens.push(
    "https://tpc.googlesyndication.com",
    "https://googleads.g.doubleclick.net",
    "https://*.doubleclick.net"
  );
}

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSrcTokens.join(" ")}`,
  `style-src ${styleSrcTokens.join(" ")}`,
  `img-src ${imgSrcTokens.join(" ")}`,
  "font-src 'self'",
  `connect-src ${connectSrcTokens.join(" ")}`,
  `frame-src ${frameSrcTokens.join(" ")}`,
].join("; ");

const themeInitScript = `(() => {
  try {
    const key = "denkotsu:theme-preference";
    const raw = window.localStorage.getItem(key);
    const preference = raw === "light" || raw === "dark" || raw === "system"
      ? raw
      : "system";
    const isDark = typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved = preference === "system" ? (isDark ? "dark" : "light") : preference;
    const root = document.documentElement;
    root.dataset.themePreference = preference;
    root.dataset.theme = resolved;
  } catch {
    const root = document.documentElement;
    root.dataset.themePreference = "system";
    root.dataset.theme = "light";
  }
})();`;

export const metadata: Metadata = {
  title: "デンコツ - 第二種電気工事士",
  description:
    "スキマ時間で合格！第二種電気工事士 学習アプリ。1問10秒のクイズで、いつの間にか合格力アップ。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "デンコツ",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0f766e",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" data-theme-preference="system" data-theme="light">
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta
          httpEquiv="Content-Security-Policy"
          content={contentSecurityPolicy}
        />
      </head>
      <body className="antialiased">
        <div className="app-frame relative pb-16">
          {children}
          <BottomNav />
        </div>
        {shouldLoadAdsenseScript && (
          <Script
            id="adsense-script"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <ServiceWorkerRegistrar />
        <CloudSyncBootstrap />
        <ThemeBootstrap />
      </body>
    </html>
  );
}
