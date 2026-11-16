"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import CoverUpload from "@/components/admin/CoverUpload";
import CollectionSelect from "@/components/admin/CollectionSelect";
import MediaInsert from "@/components/admin/MediaInsert";
import { FaqField, GalleryField, type FaqRow } from "@/components/admin/ProductExtras";

const inputClass =
  "w-full rounded-full border border-zinc-700/80 bg-[#161B26] px-5 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400";
const textareaClass =
  "w-full rounded-2xl border border-zinc-700/80 bg-[#161B26] px-5 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-y";
const labelClass = "mb-1.5 block text-xs font-medium text-zinc-400";

type ProductData = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  priceUsdt: number;
  coverImage?: string;
  gallery?: string[];
  faq?: FaqRow[];
  published: boolean;
  collection?: string | null;
  demoUrl?: string;
  fileName?: string;
  fileFormat?: string;
  fileSize?: number;
};

function formatSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [cover, setCover] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [faq, setFaq] = useState<FaqRow[]>([]);
  const [published, setPublished] = useState(false);
  const [collection, setCollection] = useState("");
  const [demoUrl, setDemoUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/admin/products/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("محصول پیدا نشد");
        const data = await res.json();
        const p: ProductData = data.product;
        if (cancelled) return;
        setProduct(p);
        setTitle(p.title ?? "");
        setSlug(p.slug ?? "");
        setDescription(p.description ?? "");
        setPrice(String(p.priceUsdt ?? ""));
        setCover(p.coverImage ?? "");
        setGallery(p.gallery ?? []);
        setFaq(p.faq ?? []);
        setPublished(Boolean(p.published));
        setCollection(p.collection ? String(p.collection) : "");
        setDemoUrl(p.demoUrl ?? "");
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "خطا");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const priceNum = Number(price);
    if (!title.trim()) return setError("عنوان را وارد کنید");
    if (!(priceNum > 0)) return setError("قیمت باید بیشتر از صفر باشد");

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          description,
          priceUsdt: priceNum,
          coverImage: cover,
          gallery,
          faq: faq.filter((f) => f.question.trim() && f.answer.trim()),
          published,
          collection: collection || null,
          demoUrl: demoUrl.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "خطا در ذخیره");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-zinc-400">در حال بارگذاری…</p>;
  if (loadError || !product) {
    return <p className="text-rose-400">{loadError ?? "محصول پیدا نشد"}</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">ویرایش محصول</h1>
          <p className="mt-1 text-sm text-zinc-400">
            فایل فعلی: {product.fileName ?? "—"}
            {product.fileFormat ? ` · ${product.fileFormat.toUpperCase()}` : ""}
            {product.fileSize ? ` · ${formatSize(product.fileSize)}` : ""}
          </p>
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
      {saved && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-900/30 px-4 py-3 text-sm text-emerald-300">
          ذخیره شد
        </div>
      )}

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5 rounded-3xl border border-zinc-800 bg-[#11141D] p-6 lg:col-span-2">
          <div>
            <label className={labelClass}>عنوان</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>توضیحات</label>
            <MediaInsert onInsert={(t) => setDescription((d) => d + (d && !d.endsWith("\n") ? "\n" : "") + t + "\n")} />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              className={textareaClass}
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
              type="number"
              step="0.01"
              min={0.01}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className={inputClass}
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

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 accent-amber-500"
            />
            <span className="text-sm text-zinc-300">منتشر شده</span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-amber-500 py-3 text-sm font-bold text-black transition-all hover:bg-amber-400 disabled:opacity-60"
          >
            {saving ? "در حال ذخیره…" : "ذخیره تغییرات"}
          </button>
        </div>
      </form>
    </div>
  );
}