"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { SessionStats } from "@/types";
import { AdSlot } from "@/components/ads/AdSlot";
import {
  getSessionCompleteAdSlot,
  shouldShowSessionCompleteAd,
} from "@/lib/ads";

interface SessionCompleteProps {
  session: SessionStats;
  passPower: number;
  onRestart: () => void;
}

const messages = [
  "おつかれさま！",
  "いい調子！",
  "ナイスファイト！",
  "また来てね！",
  "よく頑張った！",
];

export function SessionComplete({
  session,
  passPower,
  onRestart,
}: SessionCompleteProps) {
  const [message] = useState(
    () => messages[Math.floor(Math.random() * messages.length)]
  );
  const correctRate =
    session.totalAnswered > 0
      ? Math.round((session.correctCount / session.totalAnswered) * 100)
      : 0;
  const diff = passPower - session.previousPassPower;
  const showBannerAd = shouldShowSessionCompleteAd(session.totalAnswered);
  const adSlot = getSessionCompleteAdSlot();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4"
    >
      <div className="panel w-full max-w-sm px-5 py-6 text-center">
        <p className="font-display text-3xl font-bold text-teal-800 mb-4">
          {message}
        </p>

        <div className="mb-6">
          <span className="text-sm text-slate-500 font-medium">合格力</span>
          <div className="flex items-end justify-center gap-2 mt-1">
            <span className="font-display text-lg text-slate-400">
              {session.previousPassPower}%
            </span>
            <span className="text-slate-400 pb-1">→</span>
            <span className="font-display text-4xl font-bold text-teal-700 leading-none">
              {passPower}%
            </span>
            {diff > 0 && (
              <span className="text-sm text-emerald-700 font-semibold pb-1">
                +{diff}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white/85 border border-slate-200 p-4 mb-5 text-left">
          <p className="text-sm text-slate-500 mb-3 font-semibold">今回のまとめ</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">解いた問題</span>
              <span className="font-semibold text-slate-900">
                {session.totalAnswered}問
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">正解率</span>
              <span className="font-semibold text-slate-900">{correctRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">正解数</span>
              <span className="font-semibold text-slate-900">
                {session.correctCount}/{session.totalAnswered}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-3.5 rounded-xl bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 transition-colors"
          type="button"
        >
          またいつでもどうぞ
        </button>
      </div>
      {showBannerAd && <AdSlot slot={adSlot} className="mt-3 w-full max-w-sm" />}
    </motion.div>
  );
}
