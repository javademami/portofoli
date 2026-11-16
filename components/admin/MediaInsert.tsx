"use client";

import { useState } from "react";

export default function MediaInsert({ onInsert }: { onInsert: (text: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");

  async function onFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/admin/cover", { method: "POST", body: data });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "آپلود ناموفق بود");
      onInsert(`![${file.name}](${json.url})`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setUploading(false);
    }
  }

  function addVideo() {
    const url = videoUrl.trim();
    if (!/^https?:\/\//.test(url)) {
      setError("لینک ویدیو باید با http:// یا https:// شروع شود");
      return;
    }
    setError(null);
    onInsert(`[video](${url})`);
    setVideoUrl("");
  }

  return (
    <div className="space-y-2 rounded-xl border border-zinc-800 p-3 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <label className="cursor-pointer rounded-full bg-white/10 px-3 py-1 text-white hover:bg-white/20">
          {uploading ? "در حال آپلود…" : "+ افزودن عکس"}
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.gif"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
          />
        </label>
        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="لینک ویدیو (YouTube، Vimeo یا mp4)"
          dir="ltr"
          className="min-w-0 flex-1 rounded-full border border-zinc-700 bg-[#161B26] px-3 py-1 text-white"
        />
        <button type="button" onClick={addVideo} className="rounded-full bg-white/10 px-3 py-1 text-white hover:bg-white/20">
          + افزودن ویدیو
        </button>
      </div>
      {error && <p className="text-rose-400">{error}</p>}
      <p className="text-zinc-500">هر عکس یا ویدیو در یک خط جدا درج می‌شود. ترتیب خط‌ها را می‌توانی دستی تغییر بدهی.</p>
    </div>
  );
}