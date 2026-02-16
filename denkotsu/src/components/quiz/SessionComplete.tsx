"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { SessionStats } from "@/types";

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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-6"
    >
      <p className="text-2xl font-bold text-gray-900 mb-6">{message}</p>

      <div className="text-center mb-6">
        <span className="text-sm text-gray-500">合格力</span>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-lg text-gray-400">
            {session.previousPassPower}%
          </span>
          <span className="text-gray-400">→</span>
          <span className="text-3xl font-bold text-blue-600">
            {passPower}%
          </span>
          {diff > 0 && (
            <span className="text-sm text-emerald-600 font-semibold">
              +{diff}
            </span>
          )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-5 w-full max-w-xs mb-8">
        <p className="text-sm text-gray-500 mb-3">今回のまとめ</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">解いた問題</span>
            <span className="font-semibold text-gray-900">
              {session.totalAnswered}問
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">正解率</span>
            <span className="font-semibold text-gray-900">{correctRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">正解数</span>
            <span className="font-semibold text-gray-900">
              {session.correctCount}/{session.totalAnswered}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="w-full max-w-xs py-3.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
        type="button"
      >
        またいつでもどうぞ
      </button>
    </motion.div>
  );
}
