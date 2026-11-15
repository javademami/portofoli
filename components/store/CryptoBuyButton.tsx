"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/site/LanguageContext";

const T = {
  en: {
    add: "Add to cart",
    added: "This item is in your cart",
    view: "View cart",
    signIn: "Sign in to add this to your cart",
    owned: "You already own this",
    error: "Could not add it. Please try again.",
  },
  sv: {
    add: "Lägg i varukorgen",
    added: "Den här produkten finns i din varukorg",
    view: "Visa varukorg",
    signIn: "Logga in för att lägga till i varukorgen",
    owned: "Du äger redan denna",
    error: "Kunde inte lägga till. Försök igen.",
  },
};

// Adds the product to the signed-in user's cart. (Name kept for the existing store page import.)
export default function CryptoBuyButton({ productId }: { productId: string }) {
  const { lang } = useLang();
  const t = T[lang];
  const [inCart, setInCart] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cart", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d) {
          setInCart(d.items.some((i: { _id: string }) => i._id === productId));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function add() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.status === 401) return setMsg(t.signIn);
      if (res.status === 409) return setMsg(t.owned);
      if (!res.ok) return setMsg(t.error);
      setInCart(true);
      window.dispatchEvent(new Event("cart-updated"));
    } catch {
      setMsg(t.error);
    } finally {
      setBusy(false);
    }
  }

  if (inCart) {
    return (
      <div className="space-y-2">
        <a
          href="/cart"
          className="inline-flex rounded-full bg-amber-400 px-6 py-3 text-sm font-medium text-zinc-900 hover:bg-amber-300"
        >
          {t.view}
        </a>
        <p className="text-xs text-zinc-400">{t.added}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={add}
        disabled={busy}
        className="rounded-full bg-amber-400 px-6 py-3 text-sm font-medium text-zinc-900 hover:bg-amber-300 disabled:opacity-60"
      >
        {t.add}
      </button>
      {msg && <p className="text-xs text-red-400">{msg}</p>}
    </div>
  );
}
