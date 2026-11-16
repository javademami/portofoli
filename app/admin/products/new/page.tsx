"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import CoverUpload from "@/components/admin/CoverUpload";
import CollectionSelect from "@/components/admin/CollectionSelect";
import MediaInsert from "@/components/admin/MediaInsert";
import { FaqField, GalleryField, type FaqRow } from "@/components/admin/ProductExtras";

const inputClass =
  "w-full rounded-full border border-zinc-700/80 bg-[#161B26] px-5 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400";
const textareaClass =
  "w-full rounded-2xl border border-zinc-700/80 bg-[#161B26] px-5 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-y";
const labelClass = "mb-1.5 block text-xs font-medium text-zinc-400";
const MAX_FILE_BYTES = 50 * 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [faq, setFaq] = useState<FaqRow[]>([]);
  const [published, setPublished] = useState(false);
  const [collection, setCollection] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [description, setDescription] = useState("");

  const fileExt = file && file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "";

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!file) return setError("فایل محصول را انتخاب کنید");
    if (file.size > MAX_FILE_BYTES) return setError("حجم فایل نباید بیشتر از ۵۰ مگابایت باشد");

    const data = new FormData(e.currentTarget);
    const price = Number(data.get("priceUsdt"));
    if (!(price > 0)) return setError("قیمت باید بیشتر از صفر باشد");

    data.set("coverImage", cover);
    data.set("published", String(published));
    data.set("collection", collection);
    data.set("demoUrl", demoUrl);
    data.set("gallery", JSON.stringify(gallery));
    data.set("faq", JSON.stringify(faq.filter((f) => f.question.trim() && f.answer.trim())));
    data.set("fileName", file.name);
    data.set("fileFormat", fileExt);
    data.set("fileSize", String(file.size));
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
            <label className={labelClass}>Slug (اختیاری، خالی بماند از عنوان ساخته می‌شود)</label>
            <input name="slug" className={inputClass} placeholder="nextjs-guide" />
          </div>
          <div>
            <label className={labelClass}>توضیحات</label>
            <MediaInsert onInsert={(t) => setDescription((d) => d + (d && !d.endsWith("\n") ? "\n" : "") + t + "\n")} />
            <textarea
              name="description"
              required
              rows={8}
              className={textareaClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="border-t border-zinc-800 pt-5">
            <GalleryField value={gallery} onChange={setGallery} />
          </div>

          <div className="border-t border-zinc-800 pt-5">
            <FaqField value={faq} onChange={setFaq} />
          </div>
        </div>

        <div className="space-y-5 rounded-3xl border border-zinc-800 bg-[#11141D] p-6">
          <div>
            <label className={labelClass}>قیمت (USDT)</label>
            <input
              name="priceUsdt"
              type="number"
              step="0.01"
              min={0.01}
              required
              className={inputClass}
              placeholder="9.99"
            />
          </div>

          <div>
            <label className={labelClass}>لینک دمو (اختیاری)</label>
            <input
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://..."
              dir="ltr"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>مجموعه</label>
            <CollectionSelect value={collection} onChange={setCollection} />
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
                <>
                  <span className="break-all text-amber-400">{file.name}</span>
                  <span className="text-xs text-zinc-500">
                    {fileExt.toUpperCase()} · {formatSize(file.size)}
                  </span>
                </>
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