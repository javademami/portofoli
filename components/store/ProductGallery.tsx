"use client";

import { useEffect, useState } from "react";

export default function ProductGallery({
  title,
  images,
}: {
  title: string;
  images: string[];
}) {
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const count = images.length;
  const current = images[index];

  const openModal = () => {
    setMounted(true);
    setTimeout(() => setVisible(true), 10);
  };

  const closeModal = () => {
    setVisible(false);
    setTimeout(() => setMounted(false), 250);
  };

  const next = () => setIndex((i) => (i + 1) % count);
  const prev = () => setIndex((i) => (i - 1 + count) % count);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % count);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mounted, count]);

  if (count === 0) return null;

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={openModal}
        className="block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-white/10"
      >
        <img
          src={current}
          alt={`${title} ${index + 1}`}
          className="w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
        />
      </button>

      {count > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              className={`overflow-hidden rounded-lg border transition-colors ${
                i === index ? "border-amber-400" : "border-white/10"
              }`}
            >
              <img src={src} alt={`${title} ${i + 1}`} loading="lazy" className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {mounted && (
        <div
          onClick={closeModal}
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 transition-opacity duration-200 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={current}
            alt={`${title} ${index + 1}`}
            onClick={(e) => e.stopPropagation()}
            className={`max-h-[90vh] max-w-[90vw] rounded-lg object-contain transition-all duration-300 ease-out ${
              visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          />

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className={`absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-4 py-2 text-2xl text-white transition-all duration-300 hover:bg-white/20 ${
                  visible ? "opacity-100" : "opacity-0"
                }`}
                aria-label="previous"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className={`absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-4 py-2 text-2xl text-white transition-all duration-300 hover:bg-white/20 ${
                  visible ? "opacity-100" : "opacity-0"
                }`}
                aria-label="next"
              >
                ›
              </button>
            </>
          )}

          <button
            type="button"
            onClick={closeModal}
            className={`absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-white transition-opacity duration-300 hover:bg-white/20 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
            aria-label="close"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}