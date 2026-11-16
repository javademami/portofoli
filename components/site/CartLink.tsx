"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readCart } from "@/lib/guestCart";

export default function CartLink(_props: { isSignedIn?: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(readCart().length);
    sync();
    window.addEventListener("cart-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("cart-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <Link
      href="/cart"
      aria-label="cart"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 hover:border-amber-400/60"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-xs font-bold text-black">
          {count}
        </span>
      )}
    </Link>
  );
}