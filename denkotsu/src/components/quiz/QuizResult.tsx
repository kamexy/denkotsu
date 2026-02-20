"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { AchievementDefinition, CollectionItem, Question } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import { getKeyPointsByCategory } from "@/lib/key-points";
import { COLLECTION_RARITY_LABELS } from "@/lib/collection";
import { motion } from "framer-motion";

interface QuizResultProps {
  question: Question;
  isCorrect: boolean;
  onNext: () => void;
  onEnd: () => void;
  droppedItem?: CollectionItem | null;
  unlockedAchievements?: AchievementDefinition[];
}

export function QuizResult({
  question,
  isCorrect,
  onNext,
  onEnd,
  droppedItem,
  unlockedAchievements = [],
}: QuizResultProps) {
  const relatedPoints = useMemo(
    () => getKeyPointsByCategory(question.category).slice(0, 2),
    [question.category]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 mt-4"
    >
      {/* Explanation */}
      {droppedItem && (
        <div className="panel p-4 mb-3 bg-[var(--ok-soft)]/70 border-emerald-200">
          <p className="text-base font-semibold text-emerald-800 mb-1">
            🎉 NEW 図鑑アイテム
          </p>
          <p className="text-base text-slate-800 font-semibold">
            {droppedItem.emoji} {droppedItem.name}
            <span className="ml-2 text-sm font-medium text-emerald-700">
              {COLLECTION_RARITY_LABELS[droppedItem.rarity]}
            </span>
          </p>
          <p className="text-sm text-slate-600 mt-1">{droppedItem.description}</p>
          <Link
            href="/collection"
            className="inline-block text-sm text-teal-700 font-semibold mt-2 hover:text-teal-800"
          >
            図鑑で確認する →
          </Link>
        </div>
      )}

      {unlockedAchievements.length > 0 && (
        <div className="panel p-4 mb-3 bg-[var(--primary-soft)]/65 border-teal-200">
          <p className="text-sm text-teal-800 font-semibold mb-2 tracking-wide">
            🏆 実績を解除しました
          </p>
          <div className="space-y-2">
            {unlockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="rounded-lg border border-teal-100 bg-white/85 px-3 py-2"
              >
                <p className="text-base font-semibold text-slate-800">
                  {achievement.icon} {achievement.title}
                </p>
                <p className="text-sm text-slate-600 mt-0.5">
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
          <Link
            href="/collection"
            className="inline-block text-sm text-teal-700 font-semibold mt-2 hover:text-teal-800"
          >
            実績一覧を見る →
          </Link>
        </div>
      )}

      <div
        className={`panel p-4 ${
          isCorrect ? "bg-[var(--primary-soft)]/80" : "bg-[var(--accent-soft)]/80"
        }`}
      >
        <p
          className={`text-base font-semibold mb-1 ${
            isCorrect ? "text-teal-800" : "text-amber-800"
          }`}
        >
          {isCorrect ? "💡 解説" : "💡 正解と解説"}
        </p>
        <p className="text-base text-slate-700 leading-relaxed">
          {question.explanation}
        </p>
      </div>

      {/* Related key points */}
      {relatedPoints.length > 0 && (
        <div className="mt-3 panel p-4">
          <p className="text-sm text-slate-500 font-semibold tracking-wide mb-2">
            📖 関連する要点
          </p>
          <div className="space-y-2">
            {relatedPoints.map((kp) => (
              <div
                key={kp.id}
                className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5"
              >
                <p className="text-sm font-bold text-slate-800">{kp.title}</p>
                {kp.formula && (
                  <p className="text-sm font-mono text-teal-700 mt-0.5">
                    {kp.formula}
                  </p>
                )}
                <p className="text-sm text-slate-600 mt-1 leading-relaxed line-clamp-2">
                  {kp.body}
                </p>
              </div>
            ))}
          </div>
          <Link
            href={`/learn?category=${question.category}`}
            className="inline-block text-sm text-teal-700 font-semibold mt-2 hover:text-teal-800"
          >
            {CATEGORY_LABELS[question.category]}の要点をもっと見る →
          </Link>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={onNext}
          className="flex-1 py-3.5 rounded-xl bg-teal-700 text-white font-semibold text-base hover:bg-teal-800 transition-colors shadow-sm"
          type="button"
        >
          もう1問
        </button>
        <button
          onClick={onEnd}
          className="flex-1 py-3.5 rounded-xl bg-white/85 text-slate-600 border border-slate-200 font-semibold text-base hover:bg-white transition-colors"
          type="button"
        >
          ここまで
        </button>
      </div>
    </motion.div>
  );
}
