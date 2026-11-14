"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useLang } from "@/components/site/LanguageContext";

type Status = "open" | "answered" | "closed";
type TicketRow = { _id: string; subject: string; status: Status; lastMessageAt: string };

const T = {
  en: {
    back: "Back to my account",
    title: "Support tickets",
    newBtn: "New ticket",
    cancel: "Cancel",
    subject: "Subject",
    message: "Message",
    hint: "Describe your problem clearly. We usually reply within 24 hours.",
    send: "Send ticket",
    sending: "Sending…",
    loading: "Loading…",
    empty: "You have no tickets yet.",
    signIn: "Please sign in to continue.",
    error: "Something went wrong. Please try again.",
    lastActivity: "Last activity",
    status: { open: "Open", answered: "Answered", closed: "Closed" },
  },
  sv: {
    back: "Tillbaka till mitt konto",
    title: "Supportärenden",
    newBtn: "Nytt ärende",
    cancel: "Avbryt",
    subject: "Ämne",
    message: "Meddelande",
    hint: "Beskriv ditt problem tydligt. Vi brukar svara inom 24 timmar.",
    send: "Skicka ärende",
    sending: "Skickar…",
    loading: "Laddar…",
    empty: "Du har inga ärenden ännu.",
    signIn: "Logga in för att fortsätta.",
    error: "Något gick fel. Försök igen.",
    lastActivity: "Senaste aktivitet",
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

export default function TicketsPage() {
  const { lang } = useLang();
  const t = T[lang];
  const router = useRouter();

  const [tickets, setTickets] = useState<TicketRow[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tickets", { cache: "no-store" })
      .then(async (res) => {
        if (res.status === 401) throw new Error("401");
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setTickets(data.tickets);
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message === "401" ? t.signIn : t.error);
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setSending(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      if (res.status === 401) {
        setFormError(t.signIn);
        return;
      }
      if (!res.ok) {
        setFormError(t.error);
        return;
      }
      const data = await res.json();
      router.push(`/dashboard/tickets/${data.id}`);
    } catch {
      setFormError(t.error);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-zinc-100">
      <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-amber-300">
        ← {t.back}
      </Link>

      <div className="mt-4 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">{t.title}</h1>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full bg-amber-400 px-5 py-2 text-sm font-medium text-zinc-900 hover:bg-amber-300"
        >
          {showForm ? t.cancel : t.newBtn}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-zinc-400">{t.hint}</p>
          <label className="block">
            <span className="mb-1 block text-sm text-zinc-300">{t.subject}</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              required
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 outline-none focus:border-amber-400/60"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-zinc-300">{t.message}</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={5000}
              required
              rows={6}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 outline-none focus:border-amber-400/60"
            />
          </label>
          {formError && <p className="text-sm text-red-400">{formError}</p>}
          <button
            type="submit"
            disabled={sending}
            className="rounded-full bg-amber-400 px-6 py-2.5 text-sm font-medium text-zinc-900 hover:bg-amber-300 disabled:opacity-60"
          >
            {sending ? t.sending : t.send}
          </button>
        </form>
      )}

      <div className="mt-8 space-y-3">
        {loadError && <p className="text-red-400">{loadError}</p>}
        {!tickets && !loadError && <p className="text-zinc-400">{t.loading}</p>}
        {tickets && tickets.length === 0 && <p className="text-zinc-400">{t.empty}</p>}
        {tickets?.map((tk) => (
          <Link
            key={tk._id}
            href={`/dashboard/tickets/${tk._id}`}
            className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 hover:border-amber-400/40"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{tk.subject}</p>
              <p className="mt-1 text-xs text-zinc-400">
                {t.lastActivity}: {fmt(tk.lastMessageAt, lang)}
              </p>
            </div>
            <span className={`shrink-0 rounded-full border px-3 py-1 text-xs ${BADGE[tk.status]}`}>
              {t.status[tk.status]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
