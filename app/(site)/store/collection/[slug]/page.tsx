import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Collection } from "@/models/Collection";
import { Product } from "@/models/Product";
import Bi from "@/components/site/Bi";

export const dynamic = "force-dynamic";

type Params = { slug: string };

async function loadCollection(slug: string) {
  await connectDB();
  const collection = await Collection.findOne({ slug, published: true }).lean();
  if (!collection) return null;

  const [children, products] = await Promise.all([
    Collection.find({ parent: collection._id, published: true }).sort({ order: 1, name: 1 }).lean(),
    Product.find({ collection: collection._id, published: true })
      .select("title slug priceUsdt coverImage")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const trail: { name: string; slug: string }[] = [];
  let cursor = collection.parent ? String(collection.parent) : null;
  for (let i = 0; cursor && i < 20; i++) {
    const parent = await Collection.findById(cursor).select("name slug parent").lean();
    if (!parent) break;
    trail.unshift({ name: parent.name, slug: parent.slug });
    cursor = parent.parent ? String(parent.parent) : null;
  }

  return { collection, children, products, trail };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadCollection(slug);
  if (!data) return { title: "Not found" };
  return {
    title: data.collection.name,
    description: data.collection.description?.slice(0, 160),
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const data = await loadCollection(slug);
  if (!data) notFound();
  const { collection, children, products, trail } = data;

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 text-white">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-white/50">
        <Link href="/store" className="hover:text-white">
          <Bi en="Store" sv="Butik" />
        </Link>
        {trail.map((t) => (
          <span key={t.slug} className="flex items-center gap-2">
            <span>/</span>
            <Link href={`/store/collection/${t.slug}`} className="hover:text-white">
              {t.name}
            </Link>
          </span>
        ))}
        <span className="flex items-center gap-2">
          <span>/</span>
          <span className="text-white">{collection.name}</span>
        </span>
      </nav>

      <header className="space-y-3">
        <h1 className="text-3xl font-bold">{collection.name}</h1>
        {collection.description && (
          <p className="whitespace-pre-line text-white/70">{collection.description}</p>
        )}
      </header>

      {children.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            <Bi en="Subcollections" sv="Underkategorier" />
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((c) => (
              <Link
                key={String(c._id)}
                href={`/store/collection/${c.slug}`}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] hover:border-amber-400/50"
              >
                {c.coverImage && (
                  <img src={c.coverImage} alt={c.name} className="aspect-video w-full object-cover" />
                )}
                <div className="p-4 font-medium">{c.name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          <Bi en="Products" sv="Produkter" />
        </h2>
        {products.length === 0 ? (
          <p className="text-white/50">
            <Bi en="No products yet." sv="Inga produkter ännu." />
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
      </section>
    </main>
  );
}