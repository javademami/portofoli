"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLang } from "@/components/site/LanguageContext";

const B = {
  en: { buy: "Pay with USDT", loading: "Creating order…", login: "Please sign in first.", signIn: "Sign in", error: "Something went wrong. Try again." },
  sv: { buy: "Betala med USDT", loading: "Skapar beställning…", login: "Logga in först.", signIn: "Logga in", error: "Något gick fel. Försök igen." },
};

export default function CryptoBuyButton({ productId }: { productId: string }) {
  const { lang } = useLang();
  const t = B[lang];
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<"login" | "error" | null>(null);

  const onClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/crypto/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.status === 401) {
        setError("login");
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "error");
      router.push(`/checkout/crypto/${json.id}`);
    } catch {
      setError("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-60"
      >
        {loading ? t.loading : t.buy}
      </button>
      {error === "login" && (
        <p className="text-sm text-zinc-400">
          {t.login}{" "}
          <Link href="/sign-in" className="text-amber-400 underline">{t.signIn}</Link>
        </p>
      )}
      {error === "error" && <p className="text-sm text-rose-400">{t.error}</p>}
    </div>
  );
}
