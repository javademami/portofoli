"use client";

import Link from "next/link";
import AdminNavbarLink from "@/components/AdminNavbarLink";
import { useLang } from "@/components/site/LanguageContext";
import { SITE_T } from "@/components/site/siteStrings";

const LEGAL = {
  en: { terms: "Terms of Sale", privacy: "Privacy", refund: "Refunds" },
  sv: { terms: "Villkor", privacy: "Integritet", refund: "Återbetalning" },
};

export default function SiteFooter() {
  const { lang } = useLang();
  const t = SITE_T[lang];
  const legal = LEGAL[lang];
  const linkClass = "hover:text-white transition-colors";

  return (
    <footer className="bg-[#0B0D13] text-zinc-400 py-10 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs">
            JE
          </div>
          <span>© {new Date().getFullYear()} Javad Emami. {t.rights}</span>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <Link className={linkClass} href="/#hero">{t.nav.home}</Link>
          <Link className={linkClass} href="/#about">{t.nav.about}</Link>
          <Link className={linkClass} href="/#skills">{t.nav.skills}</Link>
          <Link className={linkClass} href="/#projects">{t.nav.projects}</Link>
          <Link className={linkClass} href="/#experience">{t.nav.experience}</Link>
          <Link className={linkClass} href="/#contact">{t.nav.contact}</Link>
          <Link className={linkClass} href="/store">{t.nav.store}</Link>
          <Link className={linkClass} href="/blog">{t.nav.blog}</Link>
          <Link className={linkClass} href="/terms">{legal.terms}</Link>
          <Link className={linkClass} href="/privacy">{legal.privacy}</Link>
          <Link className={linkClass} href="/refund">{legal.refund}</Link>
          <AdminNavbarLink />
        </div>
      </div>
    </footer>
  );
}
