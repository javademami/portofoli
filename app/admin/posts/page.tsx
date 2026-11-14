"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Row = {
  _id: string;
  title: string;
  slug: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
};

export default function AdminPostsPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/posts", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setRows(data.posts);
      setError("");
    } catch {
      setError("خطا در دریافت پست‌ها");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
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
    <div dir="rtl" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">پست‌های وبلاگ</h1>
        <Link
          href="/admin/posts/new"
          className="rounded-full bg-amber-400 px-5 py-2 text-sm font-medium text-zinc-900 hover:bg-amber-300"
        >
          پست جدید
        </Link>
      </div>

      {error && <p className="text-red-400">{error}</p>}
      {!rows && !error && <p className="text-zinc-400">در حال بارگذاری…</p>}
      {rows && rows.length === 0 && <p className="text-zinc-400">هنوز پستی ساخته نشده است.</p>}

      <div className="space-y-3">
        {rows?.map((r) => (
          <div
            key={r._id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-5"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{r.title}</p>
              <p className="mt-1 text-xs text-zinc-400">
                <span dir="ltr">/{r.slug}</span> ·{" "}
                {r.published
                  ? `منتشر شده: ${new Date(r.publishedAt ?? r.createdAt).toLocaleDateString("fa-IR")}`
                  : "پیش‌نویس"}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {r.published && (
                <Link
                  href={`/blog/${r.slug}`}
                  target="_blank"
                  className="rounded-full border border-white/10 px-4 py-1.5 text-zinc-300 hover:border-amber-400/40"
                >
                  مشاهده
                </Link>
              )}
              <Link
                href={`/admin/posts/${r._id}`}
                className="rounded-full border border-white/10 px-4 py-1.5 text-zinc-300 hover:border-amber-400/40"
              >
                ویرایش
              </Link>
              {confirmId === r._id ? (
                <>
                  <button
                    type="button"
                    disabled={busyId === r._id}
                    onClick={() => remove(r._id)}
                    className="rounded-full bg-red-500 px-4 py-1.5 text-white hover:bg-red-400 disabled:opacity-60"
                  >
                    تایید حذف
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmId(null)}
                    className="rounded-full border border-white/10 px-4 py-1.5 text-zinc-300"
                  >
                    انصراف
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmId(r._id)}
                  className="rounded-full border border-white/10 px-4 py-1.5 text-zinc-400 hover:border-red-400/40 hover:text-red-400"
                >
                  حذف
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
