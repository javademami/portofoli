"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Stats = { products: { total: number; published: number; draft: number } };

function StatCard({ label, value, tone }: { label: string; value: number | string; tone: string }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#11141D] p-6">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className={`mt-3 text-4xl font-extrabold ${tone}`}>{value}</p>
    </div>
  );
}

export default function AdminHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setStats)
      .catch(() => setError("بارگذاری آمار ناموفق بود"));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold">داشبورد</h1>
        <p className="mt-1 text-sm text-zinc-400">خلاصه‌ی فروشگاه و وبلاگ</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-900/30 px-4 py-3 text-sm text-rose-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {!stats ? (
          [0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl border border-zinc-800 bg-[#11141D]" />
          ))
        ) : (
          <>
            <StatCard label="کل محصولات" value={stats.products.total} tone="text-amber-400" />
            <StatCard label="منتشرشده" value={stats.products.published} tone="text-emerald-400" />
            <StatCard label="پیش‌نویس" value={stats.products.draft} tone="text-zinc-300" />
          </>
        )}
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-[#11141D] p-6">
        <h2 className="mb-4 font-bold">دسترسی سریع</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/products/new" className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-400">
            + محصول جدید
          </Link>
          <Link href="/admin/products" className="rounded-full border border-zinc-700 px-5 py-2.5 text-sm hover:border-zinc-500">
            مدیریت محصولات
          </Link>
        </div>
      </div>
    </div>
  );
}