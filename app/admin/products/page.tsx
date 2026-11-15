"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Row = {
  _id: string;
  title: string;
  slug: string;
  priceUsdt?: number;
  published: boolean;
  fileName: string;
};

const TABS = [
  { key: "all", label: "همه" },
  { key: "published", label: "منتشرشده" },
  { key: "draft", label: "پیش‌نویس" },
] as const;
type Tab = (typeof TABS)[number]["key"];

export default function AdminProductsPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const d = await res.json();
      setRows(d.products);
      setError("");
    } catch {
      setError("خطا در دریافت محصولات");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (rows ?? []).filter((r) => {
      const tabOk = tab === "all" || (tab === "published") === r.published;
      const searchOk = !term || r.title.toLowerCase().includes(term) || r.slug.includes(term);
      return tabOk && searchOk;
    });
  }, [rows, tab, q]);

  async function remove(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("حذف ناموفق بود");
        return;
      }
      setConfirmId(null);
      await load();
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">محصولات</h1>
          <p className="mt-1 text-sm text-zinc-400">مدیریت فایل‌های دیجیتال فروشگاه</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400"
        >
          + محصول جدید
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجو بر اساس عنوان یا slug..."
          className="min-w-[240px] flex-1 rounded-full border border-zinc-700/80 bg-[#161B26] px-5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
        />
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                tab === t.key
                  ? "border-amber-500 bg-amber-500 text-black"
                  : "border-zinc-700 text-zinc-300 hover:border-amber-400/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-rose-400">{error}</p>}
      {!rows && !error && <p className="text-zinc-400">در حال بارگذاری…</p>}

      {rows && (
        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-[#11141D]">
          <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr_1.2fr] gap-4 border-b border-zinc-800 px-6 py-3 text-xs font-medium text-zinc-500">
            <span>عنوان</span>
            <span>قیمت</span>
            <span>وضعیت</span>
            <span>فایل</span>
            <span className="text-left">عملیات</span>
          </div>

          {shown.length === 0 && <p className="px-6 py-8 text-sm text-zinc-500">محصولی پیدا نشد.</p>}

          {shown.map((r) => (
            <div
              key={r._id}
              className="grid grid-cols-[2fr_1fr_1fr_1.5fr_1.2fr] items-center gap-4 border-b border-zinc-800/60 px-6 py-4 last:border-0"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{r.title}</p>
                <p dir="ltr" className="truncate text-xs text-zinc-500">
                  {r.slug}
                </p>
              </div>

              <span className="text-sm">
                {r.priceUsdt && r.priceUsdt > 0 ? (
                  `${r.priceUsdt.toFixed(2)} USDT`
                ) : (
                  <span className="text-rose-400">قیمت نامشخص</span>
                )}
              </span>

              <span>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    r.published ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-700/40 text-zinc-400"
                  }`}
                >
                  {r.published ? "منتشرشده" : "پیش‌نویس"}
                </span>
              </span>

              <span dir="ltr" className="truncate text-xs text-zinc-400">
                {r.fileName}
              </span>

              <div className="flex items-center justify-end gap-2 text-sm">
                <Link
                  href={`/admin/products/${r._id}`}
                  className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-300 hover:border-amber-400/50"
                >
                  ویرایش
                </Link>
                {confirmId === r._id ? (
                  <>
                    <button
                      type="button"
                      disabled={busyId === r._id}
                      onClick={() => remove(r._id)}
                      className="rounded-full bg-rose-500 px-3 py-1 text-white hover:bg-rose-400 disabled:opacity-60"
                    >
                      تایید
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-300"
                    >
                      انصراف
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmId(r._id)}
                    className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-400 hover:border-rose-400/50 hover:text-rose-400"
                  >
                    حذف
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
