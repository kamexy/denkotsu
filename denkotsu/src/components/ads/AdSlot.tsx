"use client";

import { useEffect, useRef } from "react";
import { getAdsenseClientId, isAdPreviewMode } from "@/lib/ads";

interface AdSlotProps {
  slot: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({ slot, className }: AdSlotProps) {
  const clientId = getAdsenseClientId();
  const pushed = useRef(false);
  const shouldRenderRealAd = Boolean(clientId && slot);
  const shouldRenderPreview = !shouldRenderRealAd && isAdPreviewMode();

  useEffect(() => {
    if (!shouldRenderRealAd || pushed.current) return;

    try {
      window.adsbygoogle = window.adsbygoogle ?? [];
      window.adsbygoogle.push({});
      pushed.current = true;
    } catch {
      // 広告ブロッカーや初期化順で失敗しても画面は維持する
    }
  }, [shouldRenderRealAd]);

  if (!shouldRenderRealAd && !shouldRenderPreview) {
    return null;
  }

  return (
    <aside className={className}>
      <div className="panel p-3">
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
          Sponsored
        </p>
        {shouldRenderRealAd ? (
          <ins
            className="adsbygoogle block w-full min-h-[64px]"
            style={{ display: "block" }}
            data-ad-client={clientId}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <div className="mt-1 rounded-lg border border-dashed border-slate-300 bg-white/75 px-3 py-4 text-center text-sm text-slate-500">
            広告プレビュー（本番では AdSense の広告が表示されます）
          </div>
        )}
      </div>
    </aside>
  );
}

