"use client";

import Link from "next/link";
import { useState } from "react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import AdminNavbarLink from "@/components/AdminNavbarLink";
import { useLang, type Lang } from "@/components/site/LanguageContext";
import { SITE_T } from "@/components/site/siteStrings";

export default function SiteHeader({ isSignedIn }: { isSignedIn: boolean }) {
  const { lang, setLang } = useLang();
  const t = SITE_T[lang];
  const [open, setOpen] = useState(false);
  const linkClass = "text-zinc-400 hover:text-white transition-colors";

  const links = [
    { href: "/#hero", label: t.nav.home },
    { href: "/#about", label: t.nav.about },
    { href: "/#skills", label: t.nav.skills },
    { href: "/#projects", label: t.nav.projects },
    { href: "/#experience", label: t.nav.experience },
    { href: "/#contact", label: t.nav.contact },
    { href: "/store", label: t.nav.store },
    { href: "/blog", label: t.nav.blog },
  ];

  // Each item fades and slides in with a small delay, so the menu opens in sequence.
  const itemClass = (i: number) =>
    `transition-all duration-300 ease-out ${open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`;
  const itemDelay = (i: number) => ({ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" });

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0B0D13]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
        <Link href="/" aria-label="Javad Emami Home" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 tracking-tighter text-lg shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:border-amber-400 transition-all">
            JE
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {links.map((l) => (
            <Link key={l.href} className={linkClass} href={l.href}>
              {l.label}
            </Link>
          ))}
          <AdminNavbarLink />
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-full border border-white/15 p-0.5 text-[11px] font-bold">
            {(["en", "sv"] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`px-3 py-1 rounded-full transition-all ${
                  lang === l ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-full border border-zinc-700 text-xs font-semibold text-zinc-200 hover:border-amber-400 hover:text-amber-400 transition-all"
              >
                {t.myAccount}
              </Link>
              <UserButton />
            </>
          ) : (
            <SignInButton mode="modal">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 rounded-full bg-amber-500 text-black text-xs font-semibold hover:bg-amber-400 transition-all"
              >
                {t.signIn}
              </button>
            </SignInButton>
          )}

          <Link
            href="/#contact"
            className="hidden lg:inline-flex items-center px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide text-amber-400 border border-amber-500/40 hover:bg-amber-500/10 transition-all"
          >
            {t.letsTalk}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/15 text-zinc-200 hover:border-amber-400 hover:text-amber-400 transition-all duration-300"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={`transition-transform duration-300 ${open ? "rotate-90" : "rotate-0"}`}
            >
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      <div
        inert={!open}
        className={`md:hidden grid border-t border-white/5 bg-[#0B0D13]/95 backdrop-blur-md transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <nav className="flex flex-col gap-1 px-6 py-4 text-sm font-medium">
            {links.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                style={itemDelay(i)}
                className={`rounded-xl px-3 py-3 text-zinc-300 hover:bg-white/5 hover:text-white ${itemClass(i)}`}
              >
                {l.label}
              </Link>
            ))}

            <div onClick={() => setOpen(false)} style={itemDelay(links.length)} className={`px-3 py-2 ${itemClass(links.length)}`}>
              <AdminNavbarLink />
            </div>

            {isSignedIn && (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                style={itemDelay(links.length + 1)}
                className={`rounded-xl px-3 py-3 text-amber-300 hover:bg-white/5 ${itemClass(links.length + 1)}`}
              >
                {t.myAccount}
              </Link>
            )}

            <Link
              href="/#contact"
              onClick={() => setOpen(false)}
              style={itemDelay(links.length + 2)}
              className={`mt-2 rounded-full border border-amber-500/40 px-5 py-3 text-center text-xs font-semibold tracking-wide text-amber-400 ${itemClass(links.length + 2)}`}
            >
              {t.letsTalk}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
