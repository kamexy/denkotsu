"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface ImageLightboxProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageLightbox({ src, alt, className }: ImageLightboxProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`${className} cursor-zoom-in`}
        loading="lazy"
        onClick={handleOpen}
      />
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
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-[92vw] max-h-[85vh] flex items-center justify-center bg-white rounded-xl p-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={src}
                  alt={alt}
                  className="w-full h-full max-h-[78vh] object-contain"
                />
              </motion.div>
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white text-xl"
                aria-label="閉じる"
              >
                ✕
              </button>
              <p className="absolute bottom-6 text-white/60 text-xs">
                タップで閉じる
              </p>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
