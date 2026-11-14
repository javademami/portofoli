"use client";

import { useState } from "react";

export default function CoverUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/admin/cover", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "آپلود ناموفق بود");
      onChange(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="کاور"
          className="h-40 w-full rounded-2xl border border-zinc-800 object-cover"
        />
      )}
      <label className="flex cursor-pointer flex-col items-center gap-1 rounded-2xl border border-dashed border-zinc-700 p-5 text-center text-sm text-zinc-400 hover:border-amber-400/60">
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.webp"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPick(f);
            e.target.value = "";
          }}
        />
        <span>{uploading ? "در حال آپلود…" : value ? "تغییر تصویر" : "انتخاب تصویر کاور"}</span>
      </label>
      {value && (
        <button type="button" onClick={() => onChange("")} className="text-xs text-rose-400 hover:underline">
          حذف تصویر
        </button>
      )}
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
