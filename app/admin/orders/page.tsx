"use client";

import { useEffect, useState } from "react";

type Status = "pending" | "paid" | "expired";

type OrderRow = {
  id: string;
  userId: string;
  productTitle: string;
  amount: string;
  status: Status;
  txid: string | null;
  createdAt: string;
  expiresAt: string;
  paidAt: string | null;
};

const LABEL: Record<Status, string> = { paid: "پرداخت شده", pending: "در انتظار", expired: "منقضی" };
const STYLE: Record<Status, string> = {
  paid: "bg-emerald-500/15 text-emerald-400",
  pending: "bg-amber-500/15 text-amber-400",
  expired: "bg-zinc-700/40 text-zinc-400",
};

export default function AdminOrdersPage() {
  const [rows, setRows] = useState<OrderRow[] | null>(null);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [error, setError] = useState<string | null>(null);

  const [target, setTarget] = useState<OrderRow | null>(null);
  const [txidInput, setTxidInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    fetch("/api/admin/orders", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setRows(d.orders ?? []))
      .catch(() => setError("بارگذاری سفارش‌ها ناموفق بود"));
  };

  useEffect(() => {
    load();
  }, []);

  // Close the modal with Escape.
  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) setTarget(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [target, submitting]);

  const openModal = (row: OrderRow) => {
    setTarget(row);
    setTxidInput("");
    setModalError(null);
  };

  const closeModal = () => {
    if (submitting) return;
    setTarget(null);
  };

  const submitConfirm = async () => {
    if (!target) return;
    setSubmitting(true);
    setModalError(null);
    try {
      const res = await fetch(`/api/admin/orders/${target.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txid: txidInput.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "تایید ناموفق بود");
      setTarget(null);
      load();
    } catch (e) {
      setModalError(e instanceof Error ? e.message : "تایید ناموفق بود");
    } finally {
      setSubmitting(false);
    }
  };

  const all = rows ?? [];
  const visible = all.filter((r) => filter === "all" || r.status === filter);
  const count = (s: Status) => all.filter((r) => r.status === s).length;

  const tabs: { key: "all" | Status; label: string }[] = [
    { key: "all", label: `همه (${all.length})` },
    { key: "paid", label: `پرداخت شده (${count("paid")})` },
    { key: "pending", label: `در انتظار (${count("pending")})` },
    { key: "expired", label: `منقضی (${count("expired")})` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">سفارش‌های USDT</h1>
          <p className="mt-1 text-sm text-zinc-400">وضعیت پرداخت‌های کریپتو</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500"
        >
          بروزرسانی
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-900/30 px-4 py-3 text-sm text-rose-400">{error}</div>
      )}

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setFilter(t.key)}
            className={`rounded-full px-4 py-1.5 text-xs transition-colors ${
              filter === t.key ? "bg-amber-500 font-semibold text-black" : "border border-zinc-700 text-zinc-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-[#11141D]">
        {rows === null ? (
          <div className="space-y-3 p-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-2xl bg-zinc-800/60" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="p-16 text-center text-zinc-400">سفارشی در این بخش نیست.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800 text-xs text-zinc-500">
                <tr>
                  <th className="p-4 text-right font-medium">محصول</th>
                  <th className="p-4 text-right font-medium">مبلغ (USDT)</th>
                  <th className="p-4 text-right font-medium">وضعیت</th>
                  <th className="p-4 text-right font-medium">کاربر</th>
                  <th className="p-4 text-right font-medium">تاریخ</th>
                  <th className="p-4 text-right font-medium">تراکنش</th>
                  <th className="p-4 text-left font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id} className="border-b border-zinc-800/60 last:border-0">
                    <td className="p-4 font-semibold">{r.productTitle}</td>
                    <td className="p-4 font-mono text-zinc-300">{r.amount}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STYLE[r.status]}`}>{LABEL[r.status]}</span>
                    </td>
                    <td className="p-4 font-mono text-xs text-zinc-500">{r.userId.slice(0, 14)}…</td>
                    <td className="p-4 text-xs text-zinc-400">{new Date(r.createdAt).toLocaleString("sv-SE")}</td>
                    <td className="p-4">
                      {r.txid ? (
                        <a href={`https://tronscan.org/#/transaction/${r.txid}`} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                          مشاهده
                        </a>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="p-4 text-left">
                      {r.status !== "paid" && (
                        <button
                          type="button"
                          onClick={() => openModal(r)}
                          className="rounded-full border border-emerald-500/40 px-3 py-1.5 text-xs text-emerald-400 hover:bg-emerald-500/10"
                        >
                          تایید دستی
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {target && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md space-y-6 rounded-3xl border border-zinc-800 bg-[#11141D] p-6 shadow-2xl"
          >
            <div>
              <p className="text-xs font-semibold tracking-widest text-amber-400">تایید دستی</p>
              <h2 className="mt-2 text-xl font-extrabold">{target.productTitle}</h2>
            </div>

            <div className="space-y-2 rounded-2xl border border-zinc-800 bg-[#0B0D13] p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">مبلغ</span>
                <span className="font-mono text-zinc-200">{target.amount} USDT</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">وضعیت فعلی</span>
                <span className="text-zinc-200">{LABEL[target.status]}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">کاربر</span>
                <span className="font-mono text-xs text-zinc-400">{target.userId.slice(0, 14)}…</span>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                شناسه‌ی تراکنش (txid) - اختیاری
              </label>
              <input
                value={txidInput}
                onChange={(e) => setTxidInput(e.target.value)}
                placeholder="مثلاً 6f2a…"
                dir="ltr"
                className="w-full rounded-full border border-zinc-700/80 bg-[#161B26] px-5 py-3 font-mono text-xs text-white placeholder-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <p className="mt-2 text-xs text-zinc-500">
                اگر تراکنش را در Tronscan پیدا کرده‌اید، شناسه‌اش را وارد کنید. در غیر این صورت خالی بگذارید.
              </p>
            </div>

            {modalError && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-900/30 px-4 py-3 text-sm text-rose-400">{modalError}</div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="rounded-full border border-zinc-700 px-5 py-2.5 text-sm text-zinc-300 hover:border-zinc-500 disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={submitConfirm}
                disabled={submitting}
                className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-emerald-400 disabled:opacity-60"
              >
                {submitting ? "در حال ثبت…" : "تایید سفارش"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
