"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useLang } from "@/components/site/LanguageContext";

type Item = { _id: string; title: string; slug: string; priceUsdt: number; coverImage: string };

const T = {
  en: {
    title: "Your cart",
    back: "Back to store",
    empty: "Your cart is empty.",
    browse: "Browse the store",
    remove: "Remove",
    total: "Total",
    checkout: "Pay with USDT",
    placing: "Creating order…",
    signIn: "Sign in to view your cart.",
    error: "Something went wrong. Please try again.",
    conflict: "Some items are already owned or no longer available. Please review your cart.",
    loading: "Loading…",
    note: "Pay the exact USDT amount on TRON (TRC20) within 30 minutes.",
    consent:
      "I understand this is a digital product. Delivery starts immediately after payment, and I may lose my right of withdrawal once the file is available to me.",
    terms: "Read the terms",
  },
  sv: {
    title: "Din varukorg",
    back: "Tillbaka till butiken",
    empty: "Din varukorg är tom.",
    browse: "Bläddra i butiken",
    remove: "Ta bort",
    total: "Totalt",
    checkout: "Betala med USDT",
    placing: "Skapar order…",
    signIn: "Logga in för att se din varukorg.",
    error: "Något gick fel. Försök igen.",
    conflict: "Några produkter är redan köpta eller inte längre tillgängliga. Granska din varukorg.",
    loading: "Laddar…",
    note: "Betala exakt USDT-belopp på TRON (TRC20) inom 30 minuter.",
    consent:
      "Jag förstår att detta är en digital produkt. Leveransen startar direkt efter betalningen och jag kan förlora ångerrätten när filen är tillgänglig för mig.",
    terms: "Läs villkoren",
  },
};

export default function CartPage() {
  const { lang } = useLang();
  const t = T[lang];
  const router = useRouter();

  const [items, setItems] = useState<Item[] | null>(null);
  const [totalUsdt, setTotalUsdt] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (res.status === 401) {
        setError(t.signIn);
        setItems([]);
        return;
      }
      if (!res.ok) {
        setError(t.error);
        return;
      }
      const d = await res.json();
      setItems(d.items);
      setTotalUsdt(d.totalUsdt);
      setError("");
    } catch {
      setError(t.error);
    }
  }, [t]);

  useEffect(() => {
    load();
    window.addEventListener("cart-updated", load);
    return () => window.removeEventListener("cart-updated", load);
  }, [load]);

  async function removeItem(id: string) {
    await fetch(`/api/cart/${id}`, { method: "DELETE" });
    window.dispatchEvent(new Event("cart-updated"));
  }

  async function checkout() {
    if (!consent) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/crypto/orders", { method: "POST" });
      if (res.status === 401) return setError(t.signIn);
      if (res.status === 409) {
        setError(t.conflict);
        await load();
        return;
      }
      if (!res.ok) return setError(t.error);
      const d = await res.json();
      router.push(`/checkout/crypto/${d.id}`);
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-zinc-100">
      <Link href="/store" className="text-sm text-zinc-400 hover:text-amber-300">
        ← {t.back}
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">{t.title}</h1>

      {error && <p className="mt-6 text-red-400">{error}</p>}
      {!items && !error && <p className="mt-6 text-zinc-400">{t.loading}</p>}

      {items && items.length === 0 && !error && (
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-zinc-400">{t.empty}</p>
          <Link
            href="/store"
            className="mt-4 inline-flex rounded-full bg-amber-400 px-6 py-2.5 text-sm font-medium text-zinc-900 hover:bg-amber-300"
          >
            {t.browse}
          </Link>
        </div>
      )}

      {items && items.length > 0 && (
        <>
          <div className="mt-8 space-y-4">
            {items.map((p) => (
              <div key={p._id} className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                {p.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverImage} alt="" className="h-16 w-24 rounded-2xl object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <Link href={`/store/${p.slug}`} className="font-medium hover:text-amber-300">
                    {p.title}
                  </Link>
                  <p className="mt-1 text-sm text-zinc-400">{p.priceUsdt.toFixed(2)} USDT</p>
                </div>
                <button type="button" onClick={() => removeItem(p._id)} className="text-sm text-zinc-400 hover:text-red-400">
                  {t.remove}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>{t.total}</span>
              <span>{totalUsdt.toFixed(2)} USDT</span>
            </div>
            <p className="mt-2 text-xs text-zinc-500">{t.note}</p>

            <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-amber-500"
              />
              <span>
                {t.consent}{" "}
                <Link href="/terms" className="text-amber-300 underline">
                  {t.terms}
                </Link>
              </span>
            </label>

            <button
              type="button"
              onClick={checkout}
              disabled={busy || !consent}
              className="mt-5 w-full rounded-full bg-amber-400 px-6 py-3 text-sm font-medium text-zinc-900 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? t.placing : t.checkout}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
