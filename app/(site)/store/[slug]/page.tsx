import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Purchase } from "@/models/Purchase";
import { Review } from "@/models/Review";
import CryptoBuyButton from "@/components/store/CryptoBuyButton";
import ProductGallery from "@/components/store/ProductGallery";
import ProductMeta from "@/components/store/ProductMeta";
import RichDescription from "@/components/store/RichDescription";
import ReviewForm from "@/components/store/ReviewForm";
import Bi from "@/components/site/Bi";

export const dynamic = "force-dynamic";

type Params = { slug: string };

function formatSize(bytes?: number) {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(d?: Date | string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("sv-SE");
}

async function loadProduct(slug: string) {
  await connectDB();
  return Product.findOne({ slug, published: true }).lean();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return { title: "Not found" };
  return {
    title: product.title,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.title,
      images: product.coverImage ? [product.coverImage] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();

  const { userId } = await auth();
  let purchaseId: string | null = null;
  let alreadyReviewed = false;
  if (userId) {
    const purchase = await Purchase.findOne({
      clerkUserId: userId,
      product: product._id,
      status: "paid",
    })
      .select("_id")
      .lean();
    purchaseId = purchase ? String(purchase._id) : null;
    alreadyReviewed = Boolean(await Review.exists({ product: product._id, clerkUserId: userId }));
  }

  const reviews = await Review.find({ product: product._id, approved: true })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const gallery: string[] = Array.isArray(product.gallery) ? product.gallery : [];
  const images = [product.coverImage, ...gallery].filter((s): s is string => Boolean(s));
  const faq: { question: string; answer: string }[] = Array.isArray(product.faq) ? product.faq : [];
  const price = Number(product.priceUsdt || 0).toFixed(2);
  const size = formatSize(product.fileSize);
  const downloads = product.downloadCount ?? 83;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.coverImage || undefined,
    offers:
      product.priceUsdt > 0
        ? {
            "@type": "Offer",
            price: product.priceUsdt,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          }
        : undefined,
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="grid items-start gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.title}</h1>

          <div className="sticky top-20 z-20 space-y-3 rounded-2xl border border-white/10 bg-[#0B0D13]/95 p-4 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <span className="text-2xl font-semibold text-amber-400">{price} USDT</span>
              <span className="text-sm text-white/50">
                ★ {avg ? avg.toFixed(1) : "—"} ({reviews.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.demoUrl && (
                <a
                  href={product.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full border border-amber-400/60 px-5 py-2.5 text-sm text-amber-300 hover:bg-amber-400/10"
                >
                  <Bi en="View live demo" sv="Se live-demo" />
                </a>
              )}
              {purchaseId ? (
                <Link
                  href={`/api/download/${purchaseId}`}
                  className="inline-flex rounded-full bg-amber-400 px-6 py-2.5 font-medium text-black"
                >
                  <Bi en="Download" sv="Ladda ner" />
                </Link>
              ) : (
                <CryptoBuyButton productId={String(product._id)} />
              )}
            </div>
          </div>

          <ProductMeta
            format={product.fileFormat ? product.fileFormat.toUpperCase() : "—"}
            sizeLabel={size || "—"}
            publishedAt={new Date(product.createdAt).toISOString()}
            updatedAt={new Date(product.updatedAt).toISOString()}
            downloads={downloads}
          />

          {product.description && <RichDescription text={product.description} />}

          {faq.length > 0 && (
            <section className="space-y-2 pt-2">
              <h2 className="text-xl font-semibold">
                <Bi en="FAQ" sv="Vanliga frågor" />
              </h2>
              {faq.map((item, i) => (
                <details key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <summary className="cursor-pointer font-medium">{item.question}</summary>
                  <p className="mt-2 whitespace-pre-line text-sm text-white/70">{item.answer}</p>
                </details>
              ))}
            </section>
          )}
        </div>

        <div className="md:sticky md:top-24 md:self-start">
          <ProductGallery title={product.title} images={images} />
        </div>
      </div>

      <section className="mt-16 space-y-6 border-t border-white/10 pt-10">
        <h2 className="text-2xl font-bold">
          <Bi en="Reviews" sv="Recensioner" />
        </h2>

        <ReviewForm
          productId={String(product._id)}
          signedIn={Boolean(userId)}
          purchased={Boolean(purchaseId)}
          canReview={Boolean(userId && purchaseId && !alreadyReviewed)}
        />

        {reviews.length === 0 ? (
          <p className="text-white/50">
            <Bi en="No reviews yet." sv="Inga recensioner ännu." />
          </p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li key={String(r._id)} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{r.authorName}</span>
                  <span className="text-amber-400">
                    {"★".repeat(r.rating)}
                    <span className="text-white/20">{"★".repeat(5 - r.rating)}</span>
                  </span>
                </div>
                {r.body && <p className="mt-2 whitespace-pre-line text-sm text-white/70">{r.body}</p>}
                <div className="mt-2 text-xs text-white/40">{formatDate(r.createdAt)}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}