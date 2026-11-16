import type { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Collection } from "@/models/Collection";
import { Product } from "@/models/Product";
import Bi from "@/components/site/Bi";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Store" };

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim().slice(0, 100);

  await connectDB();
  const collections = await Collection.find({ parent: null, published: true })
    .sort({ order: 1, name: 1 })
    .lean();

  const filter: Record<string, unknown> = { published: true, priceUsdt: { $gt: 0 } };
  if (query) {
    const rx = new RegExp(escapeRegex(query), "i");
    filter.$or = [{ title: rx }, { description: rx }];
  }
  const products = await Product.find(filter)
    .select("title slug priceUsdt coverImage")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 text-white">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          <Bi en="Store" sv="Butik" />
        </h1>

        <form action="/store" className="flex gap-2">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search"
            className="flex-1 rounded-full border border-white/10 bg-black/40 px-4 py-2 outline-none focus:border-amber-400"
          />
          <button type="submit" className="rounded-full bg-amber-400 px-5 py-2 font-medium text-black">
            <Bi en="Search" sv="Sök" />
          </button>
        </form>

        {collections.length > 0 && (
          <nav className="flex flex-wrap gap-2">
            <Link
              href="/store"
              className="rounded-full border border-white/15 px-4 py-1.5 text-sm hover:border-amber-400/60"
            >
              <Bi en="All" sv="Alla" />
            </Link>
            {collections.map((c) => (
              <Link
                key={String(c._id)}
                href={`/store/collection/${c.slug}`}
                className="rounded-full border border-white/15 px-4 py-1.5 text-sm hover:border-amber-400/60"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {products.length === 0 ? (
        <p className="text-white/50">
          <Bi en="No products found." sv="Inga produkter hittades." />
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Link
              key={String(p._id)}
              href={`/store/${p.slug}`}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] hover:border-amber-400/50"
            >
              {p.coverImage && (
                <img src={p.coverImage} alt={p.title} className="aspect-video w-full object-cover" />
              )}
              <div className="space-y-1 p-4">
                <div className="font-medium">{p.title}</div>
                <div className="text-amber-400">{Number(p.priceUsdt).toFixed(2)} USDT</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}