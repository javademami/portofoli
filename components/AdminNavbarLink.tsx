"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminNavbarLink() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => setIsAdmin(Boolean(data.isAdmin)))
      .catch(() => setIsAdmin(false));
  }, []);

  if (isAdmin === null) return null;
  if (!isAdmin) return null;

  return (
    <Link
      href="/admin"
      className="text-zinc-400 hover:text-white transition-colors px-3 py-1 rounded-full border border-white/10 hover:border-amber-500/50 hover:text-amber-400 transition-all"
    >
      Admin
    </Link>
  );
}