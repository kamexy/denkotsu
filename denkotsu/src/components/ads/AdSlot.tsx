"use client";

import { useEffect, useRef } from "react";
import { getAdsenseClientId, isAdPreviewMode } from "@/lib/ads";
import { trackAdSlotInteraction, trackAdSlotRendered } from "@/lib/telemetry";

interface AdSlotProps {
  slot: string;
  className?: string;
  placement?:
    | "session_complete"
    | "quiz_feedback"
    | "learn_page"
    | "stats_page"
    | "settings_page";
  context?: {
    sessionAnswered?: number;
    questionType?: "multiple_choice" | "true_false" | "image_tap";
  };
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({
  slot,
  className,
  placement = "session_complete",
  context,
}: AdSlotProps) {
  const clientId = getAdsenseClientId();
  const pushed = useRef(false);
  const trackedRendered = useRef(false);
  const shouldRenderRealAd = Boolean(clientId && slot);
  const shouldRenderPreview = !shouldRenderRealAd && isAdPreviewMode();
  const mode = shouldRenderRealAd ? "adsense" : "preview";

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

  useEffect(() => {
    if (!(shouldRenderRealAd || shouldRenderPreview)) return;
    if (trackedRendered.current) return;

    trackAdSlotRendered({
      slot: slot || "session_complete",
      mode,
      placement,
      ...context,
    });
    trackedRendered.current = true;
  }, [context, mode, placement, shouldRenderPreview, shouldRenderRealAd, slot]);

  const handleAdInteraction = () => {
    trackAdSlotInteraction({
      slot: slot || "session_complete",
      mode,
      placement,
      ...context,
    });
  };

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
          <div className="mt-1" onPointerDown={handleAdInteraction}>
            <ins
              className="adsbygoogle block w-full min-h-[64px]"
              style={{ display: "block" }}
              data-ad-client={clientId}
              data-ad-slot={slot}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        ) : (
          <div
            className="mt-1 rounded-lg border border-dashed border-slate-300 bg-white/75 px-3 py-4 text-center text-sm text-slate-500"
            onClick={handleAdInteraction}
          >
            広告プレビュー（本番では AdSense の広告が表示されます）
          </div>
        )}
      </div>
    </aside>
  );
}
