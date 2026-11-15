"use client";

import type { ReactNode } from "react";
import { useLang } from "@/components/site/LanguageContext";

// Shows the English or Swedish version depending on the language chosen on the site.
export default function Bi({ en, sv }: { en: ReactNode; sv: ReactNode }) {
  const { lang } = useLang();
  return <>{lang === "sv" ? sv : en}</>;
}
