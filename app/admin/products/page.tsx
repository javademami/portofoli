"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ProductRow = {
  _id: string;
  title: string;
  slug: string;
  priceSek: number;
  published: boolean;
  fileName: string;
  createdAt: string;
};

type StatusFilter = "all" | "published" | "draft";

export default function ProductsPage() {
  const [items, setItems] = useState<ProductRow[] | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setItems(d.products ?? []))
      .catch(() => setError("بارگذاری محصولات ناموفق بود"));
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? []).filter(
      (p) =>
        (status === "all" || (status === "published") === p.published) &&
        (p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q))
    );
  }, [items, query, status]);

  const remove = async (p: ProductRow) => {
    if (!confirm(`حذف «${p.title}» فایل هم پاک میشود و قابل بازگشت نیست.`)) return;
    const res = await fetch(`/api/admin/products/${p._id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => (prev ?? []).filter((x) => x._id !== p._id));
    } else {
      setError("حذف انجام نشد");
    }
  };

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "همه" },
    { key: "published", label: "منتشرشده" },
    { key: "draft", label: "پیشنویس" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">محصولات</h1>
          <p className="mt-1 text-sm text-zinc-400">مدیریت فایلهای دیجیتال فروشگاه</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-400"
        >
          + محصول جدید
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-900/30 px-4 py-3 text-sm text-rose-400">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجو بر اساس عنوان یا slug…"
          className="w-full max-w-sm rounded-full border border-zinc-700/80 bg-[#161B26] px-5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
        <div className="flex rounded-full border border-zinc-700 p-1 text-xs">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setStatus(t.key)}
              className={`rounded-full px-4 py-1.5 transition-colors ${
                status === t.key
                  ? "bg-amber-500 font-semibold text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-[#11141D]">
        {items === null ? (
          <div className="space-y-3 p-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-2xl bg-zinc-800/60" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-4 p-16 text-center">
            <p className="text-zinc-400">
              {items.length === 0 ? "هنوز محصولی ثبت نشده است." : "نتیجهای برای این فیلتر پیدا نشد."}
            </p>
            {items.length === 0 && (
              <Link
                href="/admin/products/new"
                className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black"
              >
                اولین محصول را اضافه کنید
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800 text-xs text-zinc-500">
                <tr>
                  <th className="p-4 text-right font-medium">عنوان</th>
                  <th className="p-4 text-right font-medium">قیمت</th>
                  <th className="p-4 text-right font-medium">وضعیت</th>
                  <th className="p-4 text-right font-medium">فایل</th>
                  <th className="p-4 text-left font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => (
                  <tr key={p._id} className="border-b border-zinc-800/60 last:border-0 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <p className="font-semibold">{p.title}</p>
                      <p className="text-xs text-zinc-500">{p.slug}</p>
                    </td>
                    <td className="p-4 text-zinc-300">{p.priceSek} SEK</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          p.published ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-700/40 text-zinc-300"
                        }`}
                      >
                        {p.published ? "منتشرشده" : "پیشنویس"}
                      </span>
                    </td>
                    <td className="max-w-[200px] truncate p-4 text-zinc-400">{p.fileName}</td>
                    <td className="p-4 text-left">
                      <div className="flex justify-end gap-4">
                        <Link href={`/admin/products/${p._id}`} className="text-amber-400 hover:underline">
                          ویرایش
                        </Link>
                        <button type="button" onClick={() => remove(p)} className="text-rose-400 hover:underline">
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
