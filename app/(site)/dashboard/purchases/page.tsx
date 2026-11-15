import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Purchase } from "@/models/Purchase";
import Bi from "@/components/site/Bi";

export const dynamic = "force-dynamic";

type Row = {
  _id: unknown;
  amountUsdt?: number;
  createdAt?: Date;
  product: { title: string; coverImage?: string } | null;
};

export default async function PurchasesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await connectDB();
  const purchases = (await Purchase.find({ clerkUserId: userId, status: "paid" })
    .sort({ createdAt: -1 })
    .populate("product", "title coverImage")
    .lean()) as unknown as Row[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-zinc-100">
      <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-amber-300">
        ← <Bi en="Back to my account" sv="Tillbaka till mitt konto" />
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">
        <Bi en="My purchases" sv="Mina köp" />
      </h1>
      <p className="mt-2 text-zinc-400">
        <Bi en="Paid products available for download." sv="Betalda produkter som kan laddas ner." />
      </p>

      {purchases.length === 0 && (
        <p className="mt-10 text-zinc-500">
          <Bi en="You have no purchases yet." sv="Du har inga köp ännu." />
        </p>
      )}

      <div className="mt-8 space-y-4">
        {purchases.map((p) => (
          <div
            key={String(p._id)}
            className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-5"
          >
            {p.product?.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.product.coverImage} alt="" className="h-14 w-20 rounded-xl object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{p.product?.title ?? "—"}</p>
              <p className="mt-1 text-xs text-zinc-400">
                {p.amountUsdt && p.amountUsdt > 0 ? `${p.amountUsdt.toFixed(2)} USDT · ` : ""}
                {p.createdAt
                  ? new Date(p.createdAt).toLocaleDateString("sv-SE", { dateStyle: "medium" })
                  : ""}
              </p>
            </div>
            <a
              href={`/api/download/${String(p._id)}`}
              className="shrink-0 rounded-full bg-amber-400 px-5 py-2 text-sm font-medium text-zinc-900 hover:bg-amber-300"
            >
              <Bi en="Download" sv="Ladda ner" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
