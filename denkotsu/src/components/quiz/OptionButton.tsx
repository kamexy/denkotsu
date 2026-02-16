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
    "w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3 min-h-[56px]";

  if (showResult) {
    if (isThisCorrect) {
      className += " border-emerald-500 bg-emerald-50 text-emerald-800";
    } else if (selected && !isCorrect) {
      className += " border-red-400 bg-red-50 text-red-800";
    } else {
      className += " border-gray-200 bg-gray-50 text-gray-400";
    }
  } else {
    className +=
      " border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 cursor-pointer";
  }

  return (
    <motion.button
      whileTap={showResult ? {} : { scale: 0.98 }}
      className={className}
      onClick={() => !showResult && onSelect(index)}
      disabled={showResult}
      type="button"
    >
      <span className="text-sm font-medium shrink-0 w-6">{labels[index]}</span>
      <span className="text-[15px] leading-snug">{text}</span>
      {showResult && isThisCorrect && (
        <span className="ml-auto text-emerald-600 text-lg shrink-0">✓</span>
      )}
      {showResult && selected && !isCorrect && (
        <span className="ml-auto text-red-500 text-lg shrink-0">✗</span>
      )}
    </motion.button>
  );
}
