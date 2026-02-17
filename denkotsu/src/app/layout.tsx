import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegistrar } from "@/components/layout/ServiceWorkerRegistrar";
import { BottomNav } from "@/components/layout/BottomNav";

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
    <html lang="ja">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self';"
        />
      </head>
      <body className="antialiased">
        <div className="app-frame relative pb-16">
          {children}
          <BottomNav />
        </div>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
