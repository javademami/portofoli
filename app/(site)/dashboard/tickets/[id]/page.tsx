"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useLang } from "@/components/site/LanguageContext";

type Status = "open" | "answered" | "closed";
type Msg = { author: "user" | "admin"; body: string; createdAt: string };
type TicketDetail = { _id: string; subject: string; status: Status; messages: Msg[] };

const T = {
  en: {
    back: "Back to tickets",
    loading: "Loading…",
    notFound: "Ticket not found.",
    signIn: "Please sign in to continue.",
    error: "Something went wrong. Please try again.",
    you: "You",
    support: "Support",
    placeholder: "Write your reply…",
    reply: "Send reply",
    sending: "Sending…",
    closedNote: "This ticket is closed. Create a new ticket if you need more help.",
    conflict: "This ticket can no longer be replied to.",
    status: { open: "Open", answered: "Answered", closed: "Closed" },
  },
  sv: {
    back: "Tillbaka till ärenden",
    loading: "Laddar…",
    notFound: "Ärendet hittades inte.",
    signIn: "Logga in för att fortsätta.",
    error: "Något gick fel. Försök igen.",
    you: "Du",
    support: "Support",
    placeholder: "Skriv ditt svar…",
    reply: "Skicka svar",
    sending: "Skickar…",
    closedNote: "Detta ärende är stängt. Skapa ett nytt ärende om du behöver mer hjälp.",
    conflict: "Det går inte att svara på detta ärende längre.",
    status: { open: "Öppen", answered: "Besvarad", closed: "Stängd" },
  },
};

const BADGE: Record<Status, string> = {
  open: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  answered: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  closed: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

function fmt(d: string, lang: "en" | "sv") {
  return new Date(d).toLocaleString(lang === "sv" ? "sv-SE" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function TicketDetailPage() {
  const { lang } = useLang();
  const t = T[lang];
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [error, setError] = useState("");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/tickets/${id}`, { cache: "no-store" });
      if (res.status === 401) {
        setError(t.signIn);
        return;
      }
      if (res.status === 404) {
        setError(t.notFound);
        return;
      }
      if (!res.ok) {
        setError(t.error);
        return;
      }
      const data = await res.json();
      setTicket(data.ticket);
      setError("");
    } catch {
      setError(t.error);
    }
  }, [id, t]);

  useEffect(() => {
    load();
  }, [load]);

  async function sendReply(e: FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply }),
      });
      if (res.status === 409) {
        setError(t.conflict);
        await load();
        return;
      }
      if (!res.ok) {
        setError(t.error);
        return;
      }
      setReply("");
      await load();
    } catch {
      setError(t.error);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-zinc-100">
      <Link href="/dashboard/tickets" className="text-sm text-zinc-400 hover:text-amber-300">
        ← {t.back}
      </Link>

      {error && <p className="mt-6 text-red-400">{error}</p>}
      {!ticket && !error && <p className="mt-6 text-zinc-400">{t.loading}</p>}

      {ticket && (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold">{ticket.subject}</h1>
            <span className={`rounded-full border px-3 py-1 text-xs ${BADGE[ticket.status]}`}>
              {t.status[ticket.status]}
            </span>
          </div>

          <div className="mt-8 space-y-4">
            {ticket.messages.map((m, i) => {
              const mine = m.author === "user";
              return (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-3xl border p-4 ${
                    mine ? "ml-auto border-amber-400/30 bg-amber-400/10" : "mr-auto border-white/10 bg-white/5"
                  }`}
                >
                  <p className="mb-1 text-xs text-zinc-400">
                    {mine ? t.you : t.support} · {fmt(m.createdAt, lang)}
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.body}</p>
                </div>
              );
            })}
          </div>

          {ticket.status === "closed" ? (
            <p className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-zinc-400">
              {t.closedNote}
            </p>
          ) : (
            <form onSubmit={sendReply} className="mt-8 space-y-3">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={t.placeholder}
                maxLength={5000}
                rows={4}
                required
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 outline-none focus:border-amber-400/60"
              />
              <button
                type="submit"
                disabled={sending}
                className="rounded-full bg-amber-400 px-6 py-2.5 text-sm font-medium text-zinc-900 hover:bg-amber-300 disabled:opacity-60"
              >
                {sending ? t.sending : t.reply}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
