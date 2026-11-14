import Link from "next/link";
import { notFound } from "next/navigation";
import { Product } from "@/models/Product";
import { connectDB } from "@/lib/mongodb";
import CryptoBuyButton from "@/components/store/CryptoBuyButton";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await connectDB();

  const product = await Product.findOne({ slug, published: true })
    .select("-fileKey")
    .lean();

  if (!product) notFound();

  const price = product.priceSek.toLocaleString("sv-SE", {
    style: "currency",
    currency: "SEK",
  });

  return (
    <div className="min-h-screen bg-[#0B0D13] text-white py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/store"
          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white mb-8"
        >
          ← Back to store
        </Link>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="bg-[#11141D] border border-zinc-800 rounded-3xl overflow-hidden">
            {product.coverImage ? (
              <img
                src={product.coverImage}
                alt={product.title}
                className="w-full h-auto object-cover"
              />
            ) : (
              <div className="aspect-[4/3] bg-gradient-to-br from-amber-500/10 to-[#0B0D13] flex items-center justify-center">
                <span className="text-amber-500 font-mono-code text-xs">No cover image</span>
              </div>
            )}
          </div>
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              {product.title}
            </h1>
            <p className="text-zinc-400 text-lg">{product.description}</p>
            <div className="pt-4">
              <span className="text-3xl font-bold text-amber-400">{price}</span>
              <span className="text-sm text-zinc-500 ml-2">SEK · digital download</span>
            </div>
            <CryptoBuyButton productId={String(product._id)} />
          </div>
        </div>
      </div>
    </div>
  );
}
