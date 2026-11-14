"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import CoverUpload from "@/components/admin/CoverUpload";

const inputClass =
  "w-full rounded-full border border-zinc-700/80 bg-[#161B26] px-5 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400";
const labelClass = "mb-1.5 block text-xs font-medium text-zinc-400";

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState("");
  const [published, setPublished] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!file) return setError("فایل محصول را انتخاب کنید");

    const data = new FormData(e.currentTarget);
    data.set("coverImage", cover);
    data.set("published", String(published));
    data.set("file", file);

    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "خطا در ذخیره");
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">محصول جدید</h1>
          <p className="mt-1 text-sm text-zinc-400">اطلاعات محصول و فایل دیجیتال را وارد کنید</p>
        </div>
        <Link href="/admin/products" className="text-sm text-zinc-400 hover:text-white">
          ← بازگشت
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-900/30 px-4 py-3 text-sm text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5 rounded-3xl border border-zinc-800 bg-[#11141D] p-6 lg:col-span-2">
          <div>
            <label className={labelClass}>عنوان</label>
            <input name="title" required className={inputClass} placeholder="مثلا: راهنمای کامل Next.js" />
          </div>
          <div>
            <label className={labelClass}>Slug (اختیاری خالی بماند از عنوان ساخته میشود)</label>
            <input name="slug" className={inputClass} placeholder="nextjs-guide" />
          </div>
          <div>
            <label className={labelClass}>توضیحات</label>
            <textarea name="description" required rows={6} className={`${inputClass} rounded-3xl`} />
          </div>
        </div>

        <div className="space-y-5 rounded-3xl border border-zinc-800 bg-[#11141D] p-6">
          <div>
            <label className={labelClass}>قیمت (SEK)</label>
            <input name="priceSek" type="number" min={0} required className={inputClass} placeholder="199" />
          </div>

          <div>
            <label className={labelClass}>تصویر کاور</label>
            <CoverUpload value={cover} onChange={setCover} />
          </div>

          <div>
            <label className={labelClass}>فایل دیجیتال (حداکثر ۵۰ مگابایت)</label>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-zinc-700 p-5 text-center text-sm text-zinc-400 hover:border-amber-400/60">
              <input
                type="file"
                accept=".pdf,.zip,.epub,.png,.jpg,.jpeg,.mp3,.mp4"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <span className="break-all text-amber-400">{file.name}</span>
              ) : (
                <span>برای انتخاب فایل کلیک کنید</span>
              )}
            </label>
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 accent-amber-500"
            />
            <span className="text-sm text-zinc-300">منتشر شود</span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-amber-500 py-3 text-sm font-bold text-black transition-all hover:bg-amber-400 disabled:opacity-60"
          >
            {saving ? "در حال آپلود و ذخیره…" : "ذخیره محصول"}
          </button>
        </div>
      </form>
    </div>
  );
}
