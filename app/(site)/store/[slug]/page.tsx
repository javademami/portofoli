import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Purchase } from "@/models/Purchase";
import CryptoBuyButton from "@/components/store/CryptoBuyButton";
import Bi from "@/components/site/Bi";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function getProduct(slug: string) {
  await connectDB();
  return Product.findOne({ slug, published: true })
    .select("title slug description priceUsdt coverImage fileName")
    .lean();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: "Product not found" };

  const description = (p.description || p.title).slice(0, 160);
  return {
    title: p.title,
    description,
    alternates: { canonical: `/store/${p.slug}` },
    openGraph: {
      title: p.title,
      description,
      type: "website",
      images: p.coverImage ? [p.coverImage] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();

  const { userId } = await auth();
  const owned = userId
    ? await Purchase.exists({ clerkUserId: userId, product: p._id, status: "paid" })
    : null;

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const hasPrice = p.priceUsdt > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: p.description || p.title,
    image: p.coverImage || undefined,
    url: `${site}/store/${p.slug}`,
    ...(hasPrice && {
      offers: {
        "@type": "Offer",
        price: p.priceUsdt.toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    }),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 text-zinc-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link href="/store" className="text-sm text-zinc-400 hover:text-amber-300">
        ← <Bi en="Back to store" sv="Tillbaka till butiken" />
      </Link>

      <div className="mt-8 grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          {p.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.coverImage} alt={p.title} className="w-full object-cover" />
          ) : (
            <div className="flex aspect-video items-center justify-center text-zinc-600">
              <Bi en="No cover" sv="Ingen bild" />
            </div>
          )}
        </div>

        <div>
          <h1 className="text-4xl font-semibold leading-tight">{p.title}</h1>
          {p.description && (
            <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-zinc-400">{p.description}</p>
          )}

          {owned ? (
            <div className="mt-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6">
              <p className="text-emerald-300">
                <Bi en="You already own this product." sv="Du äger redan denna produkt." />
              </p>
              <Link
                href="/dashboard/purchases"
                className="mt-4 inline-flex rounded-full bg-amber-400 px-6 py-2.5 text-sm font-medium text-zinc-900 hover:bg-amber-300"
              >
                <Bi en="Download from my purchases" sv="Ladda ner från Mina köp" />
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-8 flex items-baseline gap-3">
                {hasPrice ? (
                  <>
                    <span className="text-4xl font-bold text-amber-400">{p.priceUsdt.toFixed(2)} USDT</span>
                    <span className="text-sm text-zinc-500">
                      <Bi en="digital download" sv="digital nedladdning" />
                    </span>
                  </>
                ) : (
                  <span className="text-zinc-500">
                    <Bi en="Price not available yet" sv="Priset är inte tillgängligt ännu" />
                  </span>
                )}
              </div>

              {hasPrice && (
                <div className="mt-6">
                  <CryptoBuyButton productId={String(p._id)} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
