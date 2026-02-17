"use client";

import type { Question } from "@/types";
import { OptionButton } from "./OptionButton";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { motion } from "framer-motion";

interface QuizCardProps {
  question: Question;
  selectedIndex: number | null;
  isCorrect: boolean | null;
  onSelect: (index: number) => void;
}

export function QuizCard({
  question,
  selectedIndex,
  isCorrect,
  onSelect,
}: QuizCardProps) {
  const showResult = selectedIndex !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="px-4"
    >
      <div className="panel p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[10px] font-semibold text-teal-800 tracking-[0.08em]">
            QUICK QUIZ
          </span>
        </div>

        {question.image && (
          <div className="mb-4 rounded-xl overflow-hidden bg-slate-100/70 border border-slate-200">
            <ImageLightbox
              src={question.image}
              alt="問題画像"
              className="w-full max-h-[210px] object-contain p-1.5"
            />
          </div>
        )}

        <p className="text-base font-semibold text-slate-900 leading-relaxed mb-5">
          {question.question}
        </p>

        <div className="flex flex-col gap-3">
          {question.options.map((opt, i) => (
            <OptionButton
              key={i}
              index={i}
              text={opt}
              selected={selectedIndex === i}
              isCorrect={isCorrect}
              correctIndex={question.correctIndex}
              showResult={showResult}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
