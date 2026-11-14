import { Product } from "@/models/Product";
import { connectDB } from "@/lib/mongodb";
import Link from "next/link";

export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function StorePage() {
  await connectDB();
  const products = await Product.find({ published: true })
    .select("-fileKey")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="min-h-screen bg-[#0B0D13] text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-2">Store</h1>
        <p className="text-zinc-400 mb-12">Digital products. Buy once, download your files privately.</p>

        {products.length === 0 ? (
          <div className="bg-[#11141D] border border-zinc-800 rounded-3xl p-16 text-center text-zinc-400">
            No products available yet. Check back soon.
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const price = product.priceSek.toLocaleString("sv-SE", {
                style: "currency",
                currency: "SEK",
              });
              return (
                <li key={product._id.toString()}>
                  <Link
                    href={`/store/${product.slug}`}
                    className="block bg-[#11141D] border border-zinc-800 rounded-3xl overflow-hidden hover:border-amber-500/50 transition-colors group"
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-amber-500/10 to-[#0B0D13] border-b border-zinc-800 flex items-center justify-center group-hover:from-amber-500/20 transition-colors">
                      {product.coverImage ? (
                        <img
                          src={product.coverImage}
                          alt={product.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <span className="text-amber-500 font-mono-code text-xs">No cover image</span>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-zinc-400 text-sm line-clamp-2 mb-4">{product.description}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-amber-400">{price}</span>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">Digital download</span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}