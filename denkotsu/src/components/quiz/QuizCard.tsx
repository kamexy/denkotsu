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

const QUESTION_TYPE_LABEL: Record<
  NonNullable<Question["questionType"]>,
  string
> = {
  multiple_choice: "4択",
  true_false: "○✕",
  image_tap: "画像タップ",
};

function normalizeQuestionType(
  question: Question
): NonNullable<Question["questionType"]> {
  return question.questionType ?? "multiple_choice";
}

function buildMarkerLabel(
  questionType: NonNullable<Question["questionType"]>,
  index: number
): string {
  if (questionType === "true_false") {
    return index === 0 ? "○" : "✕";
  }
  return `${index + 1}`;
}

export function QuizCard({
  question,
  selectedIndex,
  isCorrect,
  onSelect,
}: QuizCardProps) {
  const showResult = selectedIndex !== null;
  const questionType = normalizeQuestionType(question);
  const hasImageTapLayout =
    questionType === "image_tap" &&
    Boolean(question.image) &&
    Array.isArray(question.hotspots) &&
    question.hotspots.length === question.options.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="px-4"
    >
      <div className="panel p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[11px] font-semibold text-teal-800 tracking-[0.08em]">
            QUICK QUIZ
          </span>
          <span className="inline-flex items-center rounded-full bg-white/85 border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 tracking-[0.06em]">
            {QUESTION_TYPE_LABEL[questionType]}
          </span>
        </div>

        {question.image && (
          <div className="diagram-surface mb-4 rounded-xl overflow-hidden border">
            {hasImageTapLayout ? (
              <ImageTapQuestion
                question={question}
                selectedIndex={selectedIndex}
                isCorrect={isCorrect}
                showResult={showResult}
                onSelect={onSelect}
              />
            ) : (
              <ImageLightbox
                src={question.image}
                alt="問題画像"
                className="w-full max-h-[210px] object-contain p-1.5"
              />
            )}
          </div>
        )}

        <p className="text-lg font-semibold text-slate-900 leading-relaxed mb-5">
          {question.question}
        </p>

        {!hasImageTapLayout && (
          <div className="flex flex-col gap-3">
            {question.options.map((opt, i) => (
              <OptionButton
                key={i}
                index={i}
                text={opt}
                markerLabel={buildMarkerLabel(questionType, i)}
                selected={selectedIndex === i}
                isCorrect={isCorrect}
                correctIndex={question.correctIndex}
                showResult={showResult}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ImageTapQuestion({
  question,
  selectedIndex,
  isCorrect,
  showResult,
  onSelect,
}: {
  question: Question;
  selectedIndex: number | null;
  isCorrect: boolean | null;
  showResult: boolean;
  onSelect: (index: number) => void;
}) {
  if (!question.image || !question.hotspots) {
    return null;
  }

  return (
    <div className="p-1.5">
      <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white">
        <ImageLightbox
          src={question.image}
          alt="画像タップ問題"
          className="w-full max-h-[220px] object-contain"
        />
        <div className="absolute inset-0">
          {question.hotspots.map((hotspot, index) => {
            const selected = selectedIndex === index;
            const isThisCorrect = index === question.correctIndex;

            let className =
              "absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-colors";

            if (showResult) {
              className +=
                " h-9 w-9 rounded-full border-2 text-sm font-bold shadow";
              if (isThisCorrect) {
                className += " border-emerald-400 bg-emerald-500 text-white";
              } else if (selected && !isCorrect) {
                className += " border-rose-400 bg-rose-500 text-white";
              } else {
                className += " border-slate-300 bg-white/80 text-slate-600";
              }
            } else {
              className +=
                " h-14 w-14 rounded-full border border-teal-500/45 bg-transparent text-teal-700 hover:border-teal-500/80 hover:bg-teal-500/10 active:scale-[0.98] active:bg-teal-500/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500 focus-visible:outline-offset-1";
            }

            return (
              <button
                key={index}
                type="button"
                className={className}
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                onClick={() => !showResult && onSelect(index)}
                disabled={showResult}
                aria-label={`画像内の選択肢${index + 1}（${question.options[index]}）`}
              >
                {showResult ? (
                  index + 1
                ) : (
                  <span
                    aria-hidden
                    className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-teal-500 bg-white/95 px-1 text-[11px] font-semibold text-teal-700 shadow-sm"
                  >
                    {index + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {showResult ? (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {question.options.map((option, index) => {
            const selected = selectedIndex === index;
            const isThisCorrect = index === question.correctIndex;

            let className = "rounded-lg border px-2 py-1.5 text-sm";
            if (isThisCorrect) {
              className += " border-emerald-400 bg-emerald-50 text-emerald-800";
            } else if (selected && !isCorrect) {
              className += " border-rose-300 bg-rose-50 text-rose-800";
            } else {
              className += " border-slate-200 bg-white/70 text-slate-500";
            }

            return (
              <div key={index} className={className}>
                <span className="font-semibold">{index + 1}.</span> {option}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-600">
          画像の該当箇所をタップして回答してください。
        </p>
      )}
    </div>
  );
}
