"use client";

import { useEffect, useState } from "react";

type Opt = { _id: string; name: string; parent?: string | null };

export default function CollectionSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [items, setItems] = useState<Opt[]>([]);

  useEffect(() => {
    fetch("/api/admin/collections", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { collections: [] }))
      .then((d) => setItems(d.collections ?? []))
      .catch(() => setItems([]));
  }, []);

  const map = new Map(items.map((i) => [i._id, i]));
  const depth = (c: Opt) => {
    let d = 0;
    let p = c.parent ?? null;
    while (p && d < 10) {
      d++;
      p = map.get(p)?.parent ?? null;
    }
    return d;
  };

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-full border border-zinc-700/80 bg-[#161B26] px-5 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
    >
      <option value="">بدون مجموعه</option>
      {items.map((i) => (
        <option key={i._id} value={i._id}>
          {"— ".repeat(depth(i))}
          {i.name}
        </option>
      ))}
    </select>
  );
}