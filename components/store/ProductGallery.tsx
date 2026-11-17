"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const styles = `
@keyframes pg-fade-in {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}
`;

export default function ProductGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const total = images.length;

  const openModal = () => {
    setOpen(true);
    requestAnimationFrame(() => setVisible(true));
  };

  const closeModal = () => {
    setVisible(false);
    setTimeout(() => setOpen(false), 300);
  };

  const next = () => setIndex((i) => (i + 1) % total);
  const prev = () => setIndex((i) => (i - 1 + total) % total);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, total]);

  if (total === 0) return null;

  const modal = (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={closeModal}
    >
      <button
        type="button"
        onClick={closeModal}
        className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-white transition duration-200 hover:rotate-90 hover:bg-white/20"
        aria-label="Close"
      >
        ✕
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-white transition duration-200 hover:-translate-x-1 hover:bg-white/20"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-white transition duration-200 hover:translate-x-1 hover:bg-white/20"
            aria-label="Next"
          >
            ›
          </button>
        </>
      )}

      <img
        key={index}
        src={images[index]}
        alt={`${title} ${index + 1}`}
        className={`max-h-[85vh] max-w-[90vw] object-contain transition-all duration-300 ease-out ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        style={visible ? { animation: "pg-fade-in 300ms ease-out" } : undefined}
        onClick={(e) => e.stopPropagation()}
      />

      {total > 1 && (
        <span className="absolute bottom-5 text-sm text-white/60">
          {index + 1} / {total}
        </span>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      <style>{styles}</style>

      <div className="group overflow-hidden rounded-2xl border border-white/10 bg-[#11141c] transition duration-300 hover:border-amber-400/40">
        <button
          type="button"
          onClick={openModal}
          className="block w-full cursor-zoom-in"
          aria-label="Open image"
        >
          <img
            key={index}
            src={images[index]}
            alt={`${title} ${index + 1}`}
            className="aspect-[16/10] w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
            style={{ animation: "pg-fade-in 300ms ease-out" }}
          />
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setIndex(i)}
            className={`aspect-video overflow-hidden rounded-lg border transition duration-200 hover:-translate-y-0.5 hover:border-amber-400/60 ${
              i === index ? "border-amber-500" : "border-white/10"
            }`}
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {open && createPortal(modal, document.body)}
    </div>
  );
}