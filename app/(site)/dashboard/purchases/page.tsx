import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Purchase } from "@/models/Purchase";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="min-h-screen bg-[#0B0D13] text-white flex items-center justify-center">
        <p className="text-zinc-400">
          Please{" "}
          <Link href="/sign-in" className="text-amber-400 hover:underline">
            sign in
          </Link>{" "}
          to view your purchases.
        </p>
      </div>
    );
  }

  await connectDB();
  const { success } = await searchParams;

  const purchases = await Purchase.find({ clerkUserId: userId, status: "paid" })
    .populate("product", "title")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="min-h-screen bg-[#0B0D13] text-white py-12 px-6">
      {success === "1" && (
        <div className="mb-6 px-5 py-3 rounded-full bg-zinc-900 text-amber-400 border border-amber-500/40 text-sm font-semibold">
          Purchase successful — you can download your files below.
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
          My purchases
        </h1>
        <p className="text-zinc-400 mb-8">Paid products available for download.</p>

        {purchases.length === 0 ? (
          <div className="bg-[#11141D] border border-zinc-800 rounded-3xl p-12 text-center text-zinc-400">
            No purchases yet. Visit the{" "}
            <Link href="/store" className="text-amber-400 hover:underline">
              store
            </Link>
            to get started.
          </div>
        ) : (
          <ul className="space-y-4">
            {purchases.map((purchase) => {
              const product = purchase.product as
                | { _id?: unknown; title?: string }
                | null;
              return (
                <li
                  key={purchase._id.toString()}
                  className="flex items-center justify-between bg-[#11141D] border border-zinc-800 rounded-3xl p-4"
                >
                  <div>
                    <p className="text-white font-semibold">
                      {product?.title ?? "Product"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {purchase.amountSek} SEK ·
                      {purchase.createdAt?.toLocaleDateString() ?? ""}
                    </p>
                  </div>
                  <a
                    href={`/api/download/${purchase._id}`}
                    className="px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors"
                  >
                    Download
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}