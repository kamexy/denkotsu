"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { Question } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import { getKeyPointsByCategory } from "@/lib/key-points";
import { motion } from "framer-motion";

interface QuizResultProps {
  question: Question;
  isCorrect: boolean;
  onNext: () => void;
  onEnd: () => void;
}

export function QuizResult({
  question,
  isCorrect,
  onNext,
  onEnd,
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
      <div
        className={`rounded-xl p-4 ${
          isCorrect ? "bg-blue-50" : "bg-amber-50"
        }`}
      >
        <p
          className={`text-sm font-semibold mb-1 ${
            isCorrect ? "text-blue-700" : "text-amber-700"
          }`}
        >
          {isCorrect ? "💡 解説" : "💡 正解と解説"}
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          {question.explanation}
        </p>
      </div>

      {/* Related key points */}
      {relatedPoints.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-400 font-medium mb-2">
            📖 関連する要点
          </p>
          <div className="space-y-2">
            {relatedPoints.map((kp) => (
              <div
                key={kp.id}
                className="bg-gray-50 rounded-lg px-3 py-2.5"
              >
                <p className="text-xs font-bold text-gray-800">{kp.title}</p>
                {kp.formula && (
                  <p className="text-xs font-mono text-blue-600 mt-0.5">
                    {kp.formula}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                  {kp.body}
                </p>
              </div>
            ))}
          </div>
          <Link
            href={`/learn?category=${question.category}`}
            className="inline-block text-xs text-blue-600 font-medium mt-2 hover:text-blue-700"
          >
            {CATEGORY_LABELS[question.category]}の要点をもっと見る →
          </Link>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={onNext}
          className="flex-1 py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
          type="button"
        >
          もう1問
        </button>
        <button
          onClick={onEnd}
          className="flex-1 py-3.5 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm hover:bg-gray-200 active:bg-gray-300 transition-colors"
          type="button"
        >
          ここまで
        </button>
      </div>
    </motion.div>
  );
}
