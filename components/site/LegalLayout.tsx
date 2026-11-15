import type { ReactNode } from "react";
import Bi from "@/components/site/Bi";

export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: { en: string; sv: string };
  updated: { en: string; sv: string };
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-zinc-200">
      <h1 className="text-3xl font-semibold text-white">
        <Bi en={title.en} sv={title.sv} />
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        <Bi en={`Last updated: ${updated.en}`} sv={`Senast uppdaterad: ${updated.sv}`} />
      </p>
      <div className="mt-8 space-y-4 leading-relaxed">{children}</div>
    </div>
  );
}
