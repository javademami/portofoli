"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLang } from "@/components/site/LanguageContext";
import { addToCart, readCart } from "@/lib/guestCart";

export default function CryptoBuyButton({ productId }: { productId: string }) {
  const { lang } = useLang();
  const t = (en: string, sv: string) => (lang === "sv" ? sv : en);
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    const sync = () => setInCart(readCart().includes(productId));
    sync();
    window.addEventListener("cart-updated", sync);
    return () => window.removeEventListener("cart-updated", sync);
  }, [productId]);

  if (inCart) {
    return (
      <Link
        href="/cart"
        className="inline-flex rounded-full bg-white/10 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/20"
      >
        {t("View cart", "Visa varukorgen")}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => addToCart(productId)}
      className="inline-flex rounded-full bg-amber-400 px-6 py-2.5 font-medium text-black hover:bg-amber-300"
    >
      {t("Add to cart", "Lägg i varukorgen")}
    </button>
  );
}