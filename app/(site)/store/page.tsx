import Link from "next/link";
import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import Bi from "@/components/site/Bi";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Store",
  description: "Digital products: templates, scripts and files ready to download.",
  alternates: { canonical: "/store" },
};

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type Props = { searchParams: Promise<{ q?: string }> };

export default async function StorePage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const term = q.trim().slice(0, 100);

  await connectDB();
  const filter: Record<string, unknown> = { published: true, priceUsdt: { $gt: 0 } };
  if (term) {
    const rx = new RegExp(escapeRegex(term), "i");
    filter.$or = [{ title: rx }, { description: rx }];
  }

  const products = await Product.find(filter)
    .select("title slug description priceUsdt coverImage")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 text-zinc-100">
      <h1 className="text-3xl font-semibold">
        <Bi en="Store" sv="Butik" />
      </h1>
      <p className="mt-2 text-zinc-400">
        <Bi
          en="Digital products, ready to download after payment."
          sv="Digitala produkter, redo att laddas ner efter betalning."
        />
      </p>

      <form method="get" className="mt-6 flex max-w-md items-center gap-3">
        <input
          name="q"
          defaultValue={term}
          className="flex-1 rounded-full border border-white/15 bg-black/30 px-5 py-2.5 text-sm text-white outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-medium text-zinc-900 hover:bg-amber-300"
        >
          <Bi en="Search" sv="Sök" />
        </button>
      </form>

      {products.length === 0 && (
        <p className="mt-10 text-zinc-500">
          {term ? (
            <Bi en="No products match your search." sv="Inga produkter matchar din sökning." />
          ) : (
            <Bi en="No products yet." sv="Inga produkter ännu." />
          )}
        </p>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <Link
            key={String(p._id)}
            href={`/store/${p.slug}`}
            className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition hover:border-amber-400/40"
          >
            {p.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.coverImage} alt={p.title} className="h-48 w-full object-cover" />
            ) : (
              <div className="flex h-48 items-center justify-center bg-white/5 text-zinc-600">
                <Bi en="No cover" sv="Ingen bild" />
              </div>
            )}
            <div className="p-6">
              <h2 className="text-lg font-medium group-hover:text-amber-300">{p.title}</h2>
              {p.description && <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{p.description}</p>}
              <p className="mt-4 text-lg font-semibold text-amber-400">{p.priceUsdt.toFixed(2)} USDT</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
