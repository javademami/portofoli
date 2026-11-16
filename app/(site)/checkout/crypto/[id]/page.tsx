"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { useLang } from "@/components/site/LanguageContext";

type OrderData = {
  status: "pending" | "paid" | "expired";
  amount: string;
  address: string;
  network: string;
  expiresAt: string;
};

export default function CryptoCheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLang();
  const t = (en: string, sv: string) => (lang === "sv" ? sv : en);

  const [order, setOrder] = useState<OrderData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState<"amount" | "address" | null>(null);

  useEffect(() => {
    let stopped = false;
    async function poll() {
      try {
        const res = await fetch(`/api/crypto/orders/${id}`, { cache: "no-store" });
        if (res.status === 401) {
          window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`;
          return;
        }
        if (!res.ok) {
          if (!stopped) setError(t("Order not found.", "Beställningen hittades inte."));
          return;
        }
        const data = (await res.json()) as OrderData;
        if (!stopped) setOrder(data);
      } catch {
        if (!stopped) setError(t("Network error.", "Nätverksfel."));
      }
    }
    poll();
    const timer = setInterval(poll, 15000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!order?.address) return;
    QRCode.toDataURL(order.address, { width: 220, margin: 1 })
      .then(setQr)
      .catch(() => setQr(""));
  }, [order?.address]);

  async function copy(text: string, which: "amount" | "address") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard may be blocked
    }
  }

  if (error) {
    return <main className="mx-auto max-w-2xl px-4 py-16 text-center text-red-400">{error}</main>;
  }
  if (!order) {
    return <main className="mx-auto max-w-2xl px-4 py-16 text-center text-white/60">{t("Loading...", "Laddar...")}</main>;
  }

  if (order.status === "paid") {
    return (
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-16 text-center text-white">
        <h1 className="text-3xl font-bold text-emerald-400">{t("Payment received", "Betalningen mottagen")}</h1>
        <p className="text-white/70">
          {t("Your products are ready in your purchases.", "Dina produkter finns i dina köp.")}
        </p>
        <Link href="/dashboard/purchases" className="inline-flex rounded-full bg-amber-400 px-6 py-3 font-medium text-black">
          {t("Go to my purchases", "Gå till mina köp")}
        </Link>
      </main>
    );
  }

  if (order.status === "expired") {
    return (
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-16 text-center text-white">
        <h1 className="text-3xl font-bold">{t("This order expired", "Beställningen har gått ut")}</h1>
        <p className="text-white/70">
          {t(
            "If you already sent the payment, it will still be matched automatically.",
            "Om du redan skickat betalningen matchas den ändå automatiskt."
          )}
        </p>
        <Link href="/store" className="inline-flex rounded-full border border-white/20 px-6 py-3">
          {t("Back to store", "Tillbaka till butiken")}
        </Link>
      </main>
    );
  }

  const remaining = Math.max(0, new Date(order.expiresAt).getTime() - now);
  const mins = String(Math.floor(remaining / 60000)).padStart(2, "0");
  const secs = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10 text-white">
      <h1 className="text-3xl font-bold">{t("Pay with USDT", "Betala med USDT")}</h1>

      <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="text-sm text-white/60">{t("Amount to send (exact)", "Belopp att skicka (exakt)")}</div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-3xl font-semibold text-amber-400">{order.amount} USDT</span>
          <button
            type="button"
            onClick={() => copy(order.amount, "amount")}
            className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
          >
            {copied === "amount" ? t("Copied", "Kopierat") : t("Copy amount", "Kopiera belopp")}
          </button>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="text-sm text-white/60">
          {t("Network", "Nätverk")}: <span className="text-white">{order.network}</span>
        </div>
        <div className="break-all rounded-xl bg-black/40 p-3 font-mono text-sm">{order.address}</div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => copy(order.address, "address")}
            className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
          >
            {copied === "address" ? t("Copied", "Kopierat") : t("Copy address", "Kopiera adress")}
          </button>
        </div>
        {qr && (
          <div className="flex justify-center">
            <img src={qr} alt="QR" className="rounded-xl bg-white p-2" width={220} height={220} />
          </div>
        )}
        <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
          {t(
            "Only send USDT on the TRC20 network. Other networks will be lost.",
            "Skicka endast USDT på TRC20-nätverket. Andra nätverk går förlorade."
          )}
        </p>
      </div>

      <div className="text-center text-white/70">
        {t("Time left", "Tid kvar")}: <span className="font-mono text-white">{mins}:{secs}</span>
      </div>
      <p className="text-center text-xs text-white/40">
        {t("We check the payment automatically. This page updates on its own.", "Vi kontrollerar betalningen automatiskt. Sidan uppdateras själv.")}
      </p>
    </main>
  );
}