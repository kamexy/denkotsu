"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface ImageLightboxProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageLightbox({ src, alt, className }: ImageLightboxProps) {
  const [open, setOpen] = useState(false);
  const isSvg = src.toLowerCase().endsWith(".svg");
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  const handleOpen = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if ("key" in e && e.key !== "Enter" && e.key !== " ") return;
    if ("key" in e) {
      e.preventDefault();
    }
    lastActiveElementRef.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    const last = lastActiveElementRef.current;
    if (last) {
      last.focus();
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleClose]);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        onKeyDown={handleOpen}
        className="w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
        aria-label={`${alt} を拡大表示`}
      >
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={900}
          sizes="(max-width: 480px) 100vw, 480px"
          className={`${className} h-auto cursor-zoom-in ${isSvg ? "diagram-image rounded-md" : ""}`}
        />
      </button>
      {open &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
              onClick={handleClose}
              role="dialog"
              aria-modal="true"
              aria-label="画像拡大プレビュー"
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-[92vw] max-h-[85vh] flex items-center justify-center bg-white rounded-xl p-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={src}
                  alt={alt}
                  width={1600}
                  height={1200}
                  sizes="92vw"
                  className={`w-full h-full max-h-[78vh] object-contain ${isSvg ? "diagram-image rounded-md" : ""}`}
                />
              </motion.div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full bg-white/20 text-white text-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="閉じる"
              >
                ✕
              </button>
              <p className="absolute bottom-6 text-white/60 text-sm">
                タップで閉じる
              </p>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
