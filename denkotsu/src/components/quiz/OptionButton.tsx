"use client";

import { motion } from "framer-motion";

interface OptionButtonProps {
  index: number;
  text: string;
  selected: boolean;
  isCorrect: boolean | null;
  correctIndex: number;
  showResult: boolean;
  onSelect: (index: number) => void;
}

const labels = ["①", "②", "③", "④"];

export function OptionButton({
  index,
  text,
  selected,
  isCorrect,
  correctIndex,
  showResult,
  onSelect,
}: OptionButtonProps) {
  const isThisCorrect = index === correctIndex;

  let className =
    "w-full px-4 py-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 min-h-[56px]";

  if (showResult) {
    if (isThisCorrect) {
      className += " border-emerald-400 bg-[var(--ok-soft)] text-emerald-900";
    } else if (selected && !isCorrect) {
      className += " border-rose-300 bg-[var(--danger-soft)] text-rose-900";
    } else {
      className += " border-slate-200 bg-white/70 text-slate-400";
    }
  } else {
    className +=
      " border-slate-200 bg-white/90 hover:border-teal-300 hover:bg-white active:bg-slate-50 text-slate-800 cursor-pointer shadow-[0_4px_14px_rgba(16,35,64,0.05)]";
  }

  return (
    <motion.button
      whileTap={showResult ? {} : { scale: 0.98 }}
      className={className}
      onClick={() => !showResult && onSelect(index)}
      disabled={showResult}
      type="button"
    >
      <span
        className={`text-xs font-bold shrink-0 h-7 w-7 rounded-full flex items-center justify-center ${
          showResult
            ? "bg-white/70 text-slate-700"
            : "bg-teal-100 text-teal-800"
        }`}
      >
        {labels[index]}
      </span>
      <span className="text-[15px] leading-snug font-medium">{text}</span>
      {showResult && isThisCorrect && (
        <span className="ml-auto text-emerald-700 text-lg shrink-0">✓</span>
      )}
      {showResult && selected && !isCorrect && (
        <span className="ml-auto text-rose-600 text-lg shrink-0">✗</span>
      )}
    </motion.button>
  );
}
