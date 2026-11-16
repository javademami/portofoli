"use client";

import { useState } from "react";

export type FaqRow = { question: string; answer: string };

const inputCls =
  "w-full rounded-xl border border-zinc-700/80 bg-[#161B26] px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400";

async function uploadImage(file: File): Promise<string> {
  const data = new FormData();
  data.append("file", file);
  const res = await fetch("/api/admin/cover", { method: "POST", body: data });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "آپلود ناموفق بود");
  return json.url as string;
}

export function GalleryField({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFiles(files: FileList) {
    setError(null);
    const room = 20 - value.length;
    if (room <= 0) {
      setError("حداکثر ۲۰ تصویر مجاز است");
      return;
    }
    const list = Array.from(files).slice(0, room);
    setUploading(true);
    const urls: string[] = [];
    try {
      for (const f of list) {
        urls.push(await uploadImage(f));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا در آپلود");
    } finally {
      if (urls.length) onChange([...value, ...urls]);
      setUploading(false);
    }
  }

  function removeAt(i: number) {
    onChange(value.filter((_, j) => j !== i));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-zinc-400">گالری تصاویر</label>
        <span className="text-xs text-zinc-500">{value.length} / 20</span>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {value.map((src, i) => (
            <div key={`${src}-${i}`} className="relative">
              <img
                src={src}
                alt={`گالری ${i + 1}`}
                className="aspect-square w-full rounded-lg border border-zinc-800 object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 rounded-full bg-black/70 px-2 text-xs text-rose-300"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="flex cursor-pointer flex-col items-center gap-1 rounded-2xl border border-dashed border-zinc-700 p-4 text-center text-sm text-zinc-400 hover:border-amber-400/60">
        <input
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.webp"
          className="hidden"
          disabled={uploading || value.length >= 20}
          onChange={(e) => {
            if (e.target.files && e.target.files.length) onFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <span>{uploading ? "در حال آپلود…" : "افزودن تصاویر گالری"}</span>
      </label>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}

export function FaqField({
  value,
  onChange,
}: {
  value: FaqRow[];
  onChange: (v: FaqRow[]) => void;
}) {
  function update(i: number, key: keyof FaqRow, val: string) {
    onChange(value.map((r, j) => (j === i ? { ...r, [key]: val } : r)));
  }

  function add() {
    if (value.length >= 30) return;
    onChange([...value, { question: "", answer: "" }]);
  }

  function remove(i: number) {
    onChange(value.filter((_, j) => j !== i));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-zinc-400">سؤالات متداول (FAQ)</label>
        <button
          type="button"
          onClick={add}
          disabled={value.length >= 30}
          className="rounded-full bg-white/10 px-3 py-1 text-xs text-white disabled:opacity-40"
        >
          + افزودن سؤال
        </button>
      </div>

      {value.map((row, i) => (
        <div key={i} className="space-y-2 rounded-2xl border border-zinc-800 p-3">
          <input
            value={row.question}
            onChange={(e) => update(i, "question", e.target.value)}
            placeholder="سؤال"
            className={inputCls}
          />
          <textarea
            value={row.answer}
            onChange={(e) => update(i, "answer", e.target.value)}
            placeholder="پاسخ"
            rows={2}
            className={`${inputCls} resize-y rounded-xl`}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-xs text-zinc-500 hover:text-rose-400"
          >
            حذف این سؤال
          </button>
        </div>
      ))}
      <p className="text-xs text-zinc-500">{value.length} / 30</p>
    </div>
  );
}