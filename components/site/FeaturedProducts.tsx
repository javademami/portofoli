"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Bi from "@/components/site/Bi";

type Item = {
  id: string;
  title: string;
  slug: string;
  priceUsdt: number;
  coverImage: string;
};

const styles = `
@keyframes fp-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

export default function FeaturedProducts() {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    fetch("/api/store/featured")
      .then((r) => r.json())
      .then((d) => setItems(d.products ?? []))
      .catch(() => setItems([]));
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 text-zinc-900">
      <style>{styles}</style>

      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-600">
            <Bi en="Store" sv="Butik" />
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
            <Bi en="Digital products" sv="Digitala produkt" />
          </h2>
        </div>
        <Link
          href="/store"
          className="text-sm font-medium text-amber-600 transition duration-200 hover:translate-x-1"
        >
          <Bi en="View all →" sv="Visa alla →" />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <Link
            key={item.id}
            href={`/store/${item.slug}`}
            className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{ animation: "fp-up 500ms ease-out backwards", animationDelay: `${i * 80}ms` }}
          >
            <div className="aspect-[16/10] overflow-hidden bg-zinc-100">
              {item.coverImage ? (
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-400">—</div>
              )}
            </div>
            <div className="p-5">
              <h3 className="line-clamp-2 font-semibold">{item.title}</h3>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-semibold text-amber-600">
                  {item.priceUsdt.toFixed(2)} USDT
                </span>
                <span className="text-sm text-zinc-500 transition duration-200 group-hover:text-amber-600">
                  <Bi en="View →" sv="Visa →" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}