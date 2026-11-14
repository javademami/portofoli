"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Status = "open" | "answered" | "closed";
type Row = { _id: string; userEmail: string; subject: string; status: Status; lastMessageAt: string };

const FILTERS: { key: "all" | Status; label: string }[] = [
  { key: "all", label: "همه" },
  { key: "open", label: "باز" },
  { key: "answered", label: "پاسخ داده شده" },
  { key: "closed", label: "بسته" },
];

const STATUS_LABEL: Record<Status, string> = {
  open: "باز",
  answered: "پاسخ داده شده",
  closed: "بسته",
};

const BADGE: Record<Status, string> = {
  open: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  answered: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  closed: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

export default function AdminTicketsPage() {
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    const url = filter === "all" ? "/api/admin/tickets" : `/api/admin/tickets?status=${filter}`;
    fetch(url, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("failed");
        return r.json();
      })
      .then((d) => {
        if (!cancelled) setRows(d.tickets);
      })
      .catch(() => {
        if (!cancelled) setError("خطا در دریافت تیکت‌ها");
      });
    return () => {
      cancelled = true;
    };
  }, [filter]);

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">پشتیبانی</h1>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                filter === f.key
                  ? "border-amber-400 bg-amber-400 text-zinc-900"
                  : "border-white/10 bg-white/5 text-zinc-300 hover:border-amber-400/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400">{error}</p>}
      {!rows && !error && <p className="text-zinc-400">در حال بارگذاری…</p>}
      {rows && rows.length === 0 && <p className="text-zinc-400">تیکتی وجود ندارد.</p>}

      <div className="space-y-3">
        {rows?.map((r) => (
          <Link
            key={r._id}
            href={`/admin/tickets/${r._id}`}
            className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 hover:border-amber-400/40"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{r.subject}</p>
              <p className="mt-1 text-xs text-zinc-400">
                {r.userEmail || "بدون ایمیل"} · {new Date(r.lastMessageAt).toLocaleString("fa-IR")}
              </p>
            </div>
            <span className={`shrink-0 rounded-full border px-3 py-1 text-xs ${BADGE[r.status]}`}>
              {STATUS_LABEL[r.status]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
