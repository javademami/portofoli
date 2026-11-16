"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLang } from "@/components/site/LanguageContext";
import { clearCart, readCart, removeFromCart } from "@/lib/guestCart";

type CartItem = { _id: string; title: string; slug: string; priceUsdt: number; coverImage?: string };
type Applied = { code: string; percentOff: number };

export default function CartPage() {
  const { lang } = useLang();
  const t = (en: string, sv: string) => (lang === "sv" ? sv : en);
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [codeInput, setCodeInput] = useState("");
  const [applied, setApplied] = useState<Applied | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [couponOk, setCouponOk] = useState(false);
  const [couponBusy, setCouponBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const ids = readCart();
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    fetch("/api/cart/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setItems(d.items ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const subtotal = items.reduce((s, i) => s + Number(i.priceUsdt || 0), 0);
  const total = applied ? (subtotal * (100 - applied.percentOff)) / 100 : subtotal;

  function removeItem(id: string) {
    removeFromCart(id);
    setItems((prev) => prev.filter((i) => i._id !== id));
  }

  async function applyCoupon() {
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    setCouponBusy(true);
    setCouponMsg(null);
    try {
      const res = await fetch(`/api/coupons/check?code=${encodeURIComponent(code)}`, { cache: "no-store" });
      if (!res.ok) {
        setApplied(null);
        setCouponOk(false);
        setCouponMsg(t("Invalid or expired code.", "Ogiltig eller utgången kod."));
        return;
      }
      const data = (await res.json()) as Applied;
      setApplied({ code: data.code, percentOff: data.percentOff });
      setCouponOk(true);
      setCouponMsg(t(`${data.percentOff}% discount applied.`, `${data.percentOff}% rabatt tillämpad.`));
    } catch {
      setCouponOk(false);
      setCouponMsg(t("Could not check the code.", "Kunde inte kontrollera koden."));
    } finally {
      setCouponBusy(false);
    }
  }

  function removeCoupon() {
    setApplied(null);
    setCouponMsg(null);
    setCodeInput("");
  }

  async function checkout() {
    if (!consent || items.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/crypto/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: items.map((i) => i._id),
          couponCode: applied?.code,
        }),
      });
      if (res.status === 401) {
        router.push(`/sign-in?redirect_url=${encodeURIComponent("/cart")}`);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("Could not create the order.", "Kunde inte skapa beställningen."));
        return;
      }
      clearCart();
      router.push(`/checkout/crypto/${data.id}`);
    } catch {
      setError(t("Network error. Please try again.", "Nätverksfel. Försök igen."));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-white/60">
        {t("Loading cart...", "Laddar varukorgen...")}
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center text-white">
        <h1 className="mb-4 text-2xl font-bold">{t("Your cart is empty", "Varukorgen är tom")}</h1>
        <Link href="/store" className="text-amber-400 underline">
          {t("Back to store", "Tillbaka till butiken")}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10 text-white">
      <h1 className="text-3xl font-bold">{t("Cart", "Varukorg")}</h1>

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item._id} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            {item.coverImage && (
              <img src={item.coverImage} alt={item.title} className="h-16 w-16 rounded-lg object-cover" />
            )}
            <div className="flex-1">
              <Link href={`/store/${item.slug}`} className="font-medium hover:underline">
                {item.title}
              </Link>
              <div className="text-sm text-amber-400">{Number(item.priceUsdt).toFixed(2)} USDT</div>
            </div>
            <button
              type="button"
              onClick={() => removeItem(item._id)}
              className="text-sm text-white/50 hover:text-red-400"
            >
              {t("Remove", "Ta bort")}
            </button>
          </li>
        ))}
      </ul>

      <section className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="font-medium">{t("Discount code", "Rabattkod")}</h2>
        {applied ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-emerald-400">
              {applied.code} · {applied.percentOff}%
            </span>
            <button type="button" onClick={removeCoupon} className="text-sm text-white/50 hover:text-red-400">
              {t("Remove", "Ta bort")}
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder={t("Enter code", "Ange kod")}
              className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 uppercase outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={applyCoupon}
              disabled={couponBusy || !codeInput.trim()}
              className="rounded-lg bg-white/10 px-4 py-2 disabled:opacity-50"
            >
              {t("Apply", "Använd")}
            </button>
          </div>
        )}
        {couponMsg && (
          <p className={`text-sm ${couponOk ? "text-emerald-400" : "text-red-400"}`}>{couponMsg}</p>
        )}
      </section>

      <section className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex justify-between text-sm text-white/60">
          <span>{t("Subtotal", "Delsumma")}</span>
          <span>{subtotal.toFixed(2)} USDT</span>
        </div>
        {applied && (
          <div className="flex justify-between text-sm text-emerald-400">
            <span>{t("Discount", "Rabatt")}</span>
            <span>-{applied.percentOff}%</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-semibold">
          <span>{t("Total", "Totalt")}</span>
          <span className="text-amber-400">{total.toFixed(2)} USDT</span>
        </div>
      </section>

      <label className="flex items-start gap-3 text-sm text-white/70">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        <span>
          {t("I accept the ", "Jag godkänner ")}
          <Link href="/terms" className="underline">
            {t("Terms of Sale", "villkoren")}
          </Link>
          {t(
            " and understand that digital products are delivered immediately.",
            " och förstår att digitala produkter levereras direkt."
          )}
        </span>
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="button"
        onClick={checkout}
        disabled={!consent || busy}
        className="w-full rounded-full bg-amber-400 py-3 font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? t("Processing...", "Bearbetar...") : t("Pay with USDT", "Betala med USDT")}
      </button>
    </main>
  );
}