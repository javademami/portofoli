"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Cart icon with item count. Refreshes when "cart-updated" is dispatched.
export default function CartLink({ isSignedIn }: { isSignedIn: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isSignedIn) {
      setCount(0);
      return;
    }
    let cancelled = false;
    const load = () => {
      fetch("/api/cart", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!cancelled && d) setCount(d.items.length);
        })
        .catch(() => {});
    };
    load();
    window.addEventListener("cart-updated", load);
    return () => {
      cancelled = true;
      window.removeEventListener("cart-updated", load);
    };
  }, [isSignedIn]);

  return (
    <Link
      href="/cart"
      aria-label="Cart"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-zinc-200 transition-all hover:border-amber-400 hover:text-amber-400"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H7" />
        <circle cx="9.5" cy="19" r="1.5" />
        <circle cx="17.5" cy="19" r="1.5" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-black">
          {count}
        </span>
      )}
    </Link>
  );
}
