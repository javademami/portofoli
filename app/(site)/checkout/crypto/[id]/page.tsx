"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLang } from "@/components/site/LanguageContext";

type OrderStatus = {
  status: "pending" | "paid" | "expired";
  amount: string;
  address: string;
  network: string;
  expiresAt: string;
};

const X = {
  en: {
    title: "Pay with USDT",
    send: "Send exactly this amount",
    to: "To this address",
    network: "Network: TRON (TRC20) only. Sending on another network will lose your funds.",
    copy: "Copy",
    copied: "Copied",
    left: "Time left",
    waiting: "Waiting for your transaction…",
    paid: "Payment received. Thank you!",
    expired: "This order has expired. Please start a new purchase.",
    mine: "Go to my purchases",
    loading: "Loading…",
  },
  sv: {
    title: "Betala med USDT",
    send: "Skicka exakt detta belopp",
    to: "Till denna adress",
    network: "Nätverk: endast TRON (TRC20). Skickar du på fel nätverk försvinner pengarna.",
    copy: "Kopiera",
    copied: "Kopierat",
    left: "Tid kvar",
    waiting: "Väntar på din transaktion…",
    paid: "Betalningen är mottagen. Tack!",
    expired: "Beställningen har gått ut. Starta ett nytt köp.",
    mine: "Gå till mina köp",
    loading: "Laddar…",
  },
};

export default function CryptoCheckoutPage() {
  const { lang } = useLang();
  const t = X[lang];
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const res = await fetch(`/api/crypto/orders/${id}`, { cache: "no-store" });
        if (res.ok && !cancelled) {
          const data: OrderStatus = await res.json();
          setOrder(data);
          if (data.status !== "pending") return;
        }
      } catch {
        // network hiccup: try again below
      }
      if (!cancelled) timer = setTimeout(poll, 15000);
    };

    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [id]);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  const copyAddress = async () => {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (!order) {
    return <div className="mx-auto max-w-2xl px-6 py-24 text-zinc-400">{t.loading}</div>;
  }

  const msLeft = new Date(order.expiresAt).getTime() - now;
  const mm = Math.max(0, Math.floor(msLeft / 60000));
  const ss = Math.max(0, Math.floor((msLeft % 60000) / 1000));

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-16">
      <h1 className="text-3xl font-extrabold">{t.title}</h1>

      {order.status === "paid" && (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-900/20 p-6 text-emerald-300">
          <p className="font-semibold">{t.paid}</p>
          <Link href="/dashboard/purchases" className="mt-4 inline-flex text-sm text-amber-400 underline">{t.mine}</Link>
        </div>
      )}

      {order.status === "expired" && (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-900/20 p-6 text-rose-300">{t.expired}</div>
      )}

      {order.status === "pending" && (
        <div className="space-y-6 rounded-3xl border border-zinc-800 bg-[#11141D] p-6">
          <div>
            <p className="text-sm text-zinc-400">{t.send}</p>
            <p className="mt-1 text-3xl font-extrabold text-amber-400">{order.amount} USDT</p>
          </div>

          <div>
            <p className="text-sm text-zinc-400">{t.to}</p>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-zinc-700 bg-[#0B0D13] p-4">
              <code className="flex-1 break-all text-sm text-zinc-200">{order.address}</code>
              <button type="button" onClick={copyAddress} className="shrink-0 rounded-full border border-zinc-600 px-4 py-2 text-xs hover:border-amber-400">
                {copied ? t.copied : t.copy}
              </button>
            </div>
          </div>

          <p className="rounded-2xl bg-amber-500/10 p-4 text-sm text-amber-300">{t.network}</p>

          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>{t.waiting}</span>
            <span>{t.left}: {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}</span>
          </div>
        </div>
      )}
    </div>
  );
}
