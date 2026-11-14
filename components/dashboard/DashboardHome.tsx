"use client";

import Link from "next/link";
import { useLang } from "@/components/site/LanguageContext";

const T = {
  en: {
    title: "My account",
    sub: "Your purchases, downloads and support in one place.",
    purchases: "My purchases",
    purchasesDesc: "Orders you have paid for and your download links.",
    tickets: "Support tickets",
    ticketsDesc: "Ask a question or follow up on an existing ticket.",
    open: "Open",
    home: "Back to home",
  },
  sv: {
    title: "Mitt konto",
    sub: "Dina köp, nedladdningar och support på ett ställe.",
    purchases: "Mina köp",
    purchasesDesc: "Beställningar du betalat för och dina nedladdningslänkar.",
    tickets: "Supportärenden",
    ticketsDesc: "Ställ en fråga eller följ upp ett befintligt ärende.",
    open: "Öppna",
    home: "Tillbaka till startsidan",
  },
};

export default function DashboardHome() {
  const { lang } = useLang();
  const t = T[lang];

  const cards = [
    { href: "/dashboard/purchases", title: t.purchases, desc: t.purchasesDesc },
    { href: "/dashboard/tickets", title: t.tickets, desc: t.ticketsDesc },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 text-zinc-100">
      <h1 className="text-3xl font-semibold">{t.title}</h1>
      <p className="mt-2 text-zinc-400">{t.sub}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-amber-400/40"
          >
            <h2 className="text-lg font-medium group-hover:text-amber-300">{c.title}</h2>
            <p className="mt-2 text-sm text-zinc-400">{c.desc}</p>
            <span className="mt-4 inline-block text-sm text-amber-300">{t.open} →</span>
          </Link>
        ))}
      </div>

      <Link href="/" className="mt-10 inline-block text-sm text-zinc-400 hover:text-amber-300">
        {t.home}
      </Link>
    </div>
  );
}
