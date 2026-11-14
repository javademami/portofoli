"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";

type Status = "open" | "answered" | "closed";
type Msg = { author: "user" | "admin"; body: string; createdAt: string };
type Ticket = {
  _id: string;
  userEmail: string;
  subject: string;
  status: Status;
  messages: Msg[];
  createdAt: string;
};

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

const fmt = (d: string) => new Date(d).toLocaleString("fa-IR", { dateStyle: "medium", timeStyle: "short" });

export default function AdminTicketPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, { cache: "no-store" });
      if (!res.ok) {
        setError(res.status === 404 ? "تیکت پیدا نشد" : "خطا در دریافت تیکت");
        return;
      }
      const data = await res.json();
      setTicket(data.ticket);
      setError("");
    } catch {
      setError("خطا در ارتباط با سرور");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function sendReply(e: FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply }),
      });
      if (!res.ok) {
        setError("ارسال پاسخ ناموفق بود");
        return;
      }
      setReply("");
      await load();
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(status: Status) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        setError("تغییر وضعیت ناموفق بود");
        return;
      }
      await load();
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div dir="rtl" className="space-y-6">
      <Link href="/admin/tickets" className="text-sm text-zinc-400 hover:text-amber-300">
        → بازگشت به لیست تیکت‌ها
      </Link>

      {error && <p className="text-red-400">{error}</p>}
      {!ticket && !error && <p className="text-zinc-400">در حال بارگذاری…</p>}

      {ticket && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold">{ticket.subject}</h1>
              <p className="mt-1 text-sm text-zinc-400">
                {ticket.userEmail || "بدون ایمیل"} · ساخته شده: {fmt(ticket.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full border px-3 py-1 text-xs ${BADGE[ticket.status]}`}>
                {STATUS_LABEL[ticket.status]}
              </span>
              <select
                value={ticket.status}
                disabled={busy}
                onChange={(e) => changeStatus(e.target.value as Status)}
                className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-sm outline-none focus:border-amber-400/60"
              >
                <option value="open">باز</option>
                <option value="answered">پاسخ داده شده</option>
                <option value="closed">بسته</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {ticket.messages.map((m, i) => {
              const fromAdmin = m.author === "admin";
              return (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-3xl border p-4 ${
                    fromAdmin ? "mr-auto border-amber-400/30 bg-amber-400/10" : "ml-auto border-white/10 bg-white/5"
                  }`}
                >
                  <p className="mb-1 text-xs text-zinc-400">
                    {fromAdmin ? "پشتیبانی" : "کاربر"} · {fmt(m.createdAt)}
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.body}</p>
                </div>
              );
            })}
          </div>

          <form onSubmit={sendReply} className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6">
            <label className="block text-sm text-zinc-300">پاسخ به کاربر</label>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              maxLength={5000}
              rows={4}
              required
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 outline-none focus:border-amber-400/60"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-amber-400 px-6 py-2.5 text-sm font-medium text-zinc-900 hover:bg-amber-300 disabled:opacity-60"
            >
              {busy ? "در حال ارسال…" : "ارسال پاسخ"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
