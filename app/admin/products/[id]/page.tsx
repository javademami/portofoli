"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import CoverUpload from "@/components/admin/CoverUpload";

type Product = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  priceSek: number;
  coverImage?: string;
  fileName: string;
  published: boolean;
};

const inputClass =
  "w-full rounded-full border border-zinc-700/80 bg-[#161B26] px-5 py-3 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400";
const labelClass = "mb-1.5 block text-xs font-medium text-zinc-400";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "خطا");
        setProduct(d.product);
      })
      .catch((e) => setLoadError(e instanceof Error ? e.message : "خطا"));
  }, [id]);

  const update = <K extends keyof Product>(key: K, value: Product[K]) =>
    setProduct((p) => (p ? { ...p, [key]: value } : p));

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: product.title,
          slug: product.slug,
          description: product.description,
          priceSek: Number(product.priceSek),
          coverImage: product.coverImage ?? "",
          published: product.published,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "خطا در ذخیره");
      router.push("/admin/products");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  if (loadError) {
    return <p className="text-rose-400">{loadError}</p>;
  }
  if (!product) {
    return <div className="h-64 animate-pulse rounded-3xl border border-zinc-800 bg-[#11141D]" />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">ویرایش محصول</h1>
          <p className="mt-1 text-sm text-zinc-400">فایل فعلی: {product.fileName}</p>
        </div>
        <Link href="/admin/products" className="text-sm text-zinc-400 hover:text-white">
          ← بازگشت
        </Link>
      </div>

      {saveError && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-900/30 px-4 py-3 text-sm text-rose-400">
          {saveError}
        </div>
      )}

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5 rounded-3xl border border-zinc-800 bg-[#11141D] p-6 lg:col-span-2">
          <div>
            <label className={labelClass}>عنوان</label>
            <input
              className={inputClass}
              value={product.title}
              onChange={(e) => update("title", e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input
              className={inputClass}
              value={product.slug}
              onChange={(e) => update("slug", e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>توضیحات</label>
            <textarea
              rows={6}
              className={`${inputClass} rounded-3xl`}
              value={product.description}
              onChange={(e) => update("description", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-5 rounded-3xl border border-zinc-800 bg-[#11141D] p-6">
          <div>
            <label className={labelClass}>قیمت (SEK)</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={product.priceSek}
              onChange={(e) => update("priceSek", Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label className={labelClass}>تصویر کاور</label>
            <CoverUpload
              value={product.coverImage ?? ""}
              onChange={(url) => update("coverImage", url)}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={product.published}
              onChange={(e) => update("published", e.target.checked)}
              className="h-4 w-4 accent-amber-500"
            />
            <span className="text-sm text-zinc-300">منتشر شده</span>
          </label>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-amber-500 py-3 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-60"
          >
            {saving ? "در حال ذخیره…" : "ذخیره تغییرات"}
          </button>
        </div>
      </form>
    </div>
  );
}
