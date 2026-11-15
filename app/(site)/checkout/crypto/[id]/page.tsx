"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLang } from "@/components/site/LanguageContext";

type OrderState = {
  status: "pending" | "paid" | "expired";
  amount: string;
  address: string;
  network: string;
  expiresAt: string;
};

const T = {
  en: {
    title: "Pay with USDT",
    loading: "Loading…",
    notFound: "Order not found.",
    error: "Could not load the order.",
    send: "Send exactly this amount:",
    address: "To this address (TRON, TRC20 only):",
    copy: "Copy",
    copied: "Copied",
    warn: "Send only USDT on the TRON network (TRC20). Other networks may lose your funds.",
    timeLeft: "Time left",
    checking: "Waiting for your payment… this page updates automatically.",
    expired: "This order has expired. Go back to your cart to start a new one.",
    paid: "Payment received. Your files are ready.",
    goPurchases: "Go to my purchases",
    backCart: "Back to cart",
  },
  sv: {
    title: "Betala med USDT",
    loading: "Laddar…",
    notFound: "Ordern hittades inte.",
    error: "Kunde inte ladda ordern.",
    send: "Skicka exakt detta belopp:",
    address: "Till denna adress (endast TRON, TRC20):",
    copy: "Kopiera",
    copied: "Kopierad",
    warn: "Skicka endast USDT på TRON-nätverket (TRC20). Andra nätverk kan innebära att du förlorar pengarna.",
    timeLeft: "Tid kvar",
    checking: "Väntar på din betalning… sidan uppdateras automatiskt.",
    expired: "Denna order har gått ut. Gå tillbaka till varukorgen för att börja om.",
    paid: "Betalningen har tagits emot. Dina filer är redo.",
    goPurchases: "Gå till Mina köp",
    backCart: "Tillbaka till varukorgen",
  },
};

function formatLeft(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function CryptoCheckoutPage() {
  const { lang } = useLang();
  const t = T[lang];
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<OrderState | null>(null);
  const [error, setError] = useState<"notFound" | "error" | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Checks the order every 15 seconds until it is paid.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      try {
        const res = await fetch(`/api/crypto/orders/${id}`, { cache: "no-store" });
        if (cancelled) return;
        if (res.status === 404) {
          setError("notFound");
          return;
        }
        if (!res.ok) {
          setError("error");
        } else {
          const d = (await res.json()) as OrderState;
          setOrder(d);
          setError(null);
          if (d.status === "paid") return;
        }
      } catch {
        if (!cancelled) setError("error");
      }
      if (!cancelled) timer = setTimeout(load, 15000);
    };

    load();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [id]);

  // Clock for the countdown.
  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  async function copyAddress() {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may be blocked; the address is still visible
    }
  }

  const left = order && now !== null ? new Date(order.expiresAt).getTime() - now : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-zinc-100">
      <h1 className="text-3xl font-semibold">{t.title}</h1>

      {error === "notFound" && <p className="mt-8 text-zinc-400">{t.notFound}</p>}
      {error === "error" && <p className="mt-8 text-red-400">{t.error}</p>}
      {!order && !error && <p className="mt-8 text-zinc-400">{t.loading}</p>}

      {order && order.status === "paid" && (
        <div className="mt-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6">
          <p className="text-emerald-300">{t.paid}</p>
          <Link
            href="/dashboard/purchases"
            className="mt-5 inline-flex rounded-full bg-amber-400 px-6 py-2.5 text-sm font-medium text-zinc-900 hover:bg-amber-300"
          >
            {t.goPurchases}
          </Link>
        </div>
      )}

      {order && order.status === "expired" && (
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-zinc-300">{t.expired}</p>
          <Link
            href="/cart"
            className="mt-5 inline-flex rounded-full border border-white/15 px-6 py-2.5 text-sm text-zinc-200 hover:border-amber-400"
          >
            {t.backCart}
          </Link>
        </div>
      )}

      {order && order.status === "pending" && (
        <div className="mt-8 space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div>
            <p className="text-sm text-zinc-400">{t.send}</p>
            <p className="mt-2 break-all text-3xl font-bold text-amber-400">{order.amount} USDT</p>
          </div>

          <div>
            <p className="text-sm text-zinc-400">{t.address}</p>
            <div className="mt-2 flex items-center gap-3">
              <code className="flex-1 break-all rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm">
                {order.address}
              </code>
              <button
                type="button"
                onClick={copyAddress}
                className="shrink-0 rounded-full border border-white/15 px-4 py-2 text-sm hover:border-amber-400"
              >
                {copied ? t.copied : t.copy}
              </button>
            </div>
          </div>

          <p className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            {t.warn}
          </p>

          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>{t.timeLeft}</span>
            <span className="font-mono text-zinc-200">{left !== null ? formatLeft(left) : "--:--"}</span>
          </div>

          <p className="text-xs text-zinc-500">{t.checking}</p>
        </div>
      )}
    </div>
  );
}
