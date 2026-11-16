"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const NAV = [
  { href: "/admin", label: "داشبورد", icon: "◻" },
  { href: "/admin/products", label: "محصولات", icon: "◈" },
  { href: "/admin/orders", label: "سفارش‌ها", icon: "▤" },
  { href: "/admin/coupons", label: "کدهای تخفیف", icon: "％" },
  { href: "/admin/collections", label: "مجموعه‌ها", icon: "▦" },
  { href: "/admin/tickets", label: "پشتیبانی", icon: "✉" },
  { href: "/admin/posts", label: "پست‌های وبلاگ", icon: "✎" },
];

function Centered({ text }: { text: string }) {
  return (
    <div className="min-h-screen bg-[#0B0D13] text-white flex items-center justify-center">
      <p className="text-zinc-400">{text}</p>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => setAllowed(Boolean(d.isAdmin)))
      .catch(() => setAllowed(false));
  }, []);

  if (allowed === null) return <Centered text="در حال بررسی دسترسی…" />;
  if (!allowed) return <Centered text="دسترسی محدود است" />;

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-5">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 font-bold text-amber-400 border border-amber-500/30">
          JE
        </div>
        <div>
          <p className="font-bold leading-tight">مدیریت</p>
          <p className="text-xs text-zinc-500 leading-tight">javad-portfolio</p>
        </div>
      </div>
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setMenuOpen(false)}
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors ${
            isActive(item.href)
              ? "bg-amber-500/15 text-amber-400"
              : "text-zinc-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <span className="w-4 text-center">{item.icon}</span>
          {item.label}
        </Link>
      ))}
      <div className="mt-auto space-y-2 border-t border-zinc-800 pt-5">
        <Link href="/" className="block rounded-2xl px-4 py-3 text-sm text-zinc-400 hover:bg-white/5 hover:text-white">
          ← بازگشت به سایت
        </Link>
      </div>
    </nav>
  );

  return (
    <div dir="rtl" className="min-h-screen bg-[#0B0D13] text-white">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 right-0 hidden w-64 border-l border-zinc-800 bg-[#0D1017] md:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 md:hidden" onClick={() => setMenuOpen(false)}>
          <aside className="absolute inset-y-0 right-0 w-72 bg-[#0D1017] border-l border-zinc-800" onClick={(e) => e.stopPropagation()}>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="md:mr-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-800 bg-[#0B0D13]/90 px-6 py-4 backdrop-blur">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm md:hidden"
          >
            منو
          </button>
          <p className="hidden text-sm text-zinc-500 md:block">پنل مدیریت</p>
        </header>
        <main className="px-6 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}
