import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/mongodb";
import { CryptoOrder } from "@/models/CryptoOrder";
import { Product } from "@/models/Product";

type RawOrder = {
  _id: unknown;
  userId: string;
  productId: unknown;
  amountMicro: number;
  status: "pending" | "paid" | "expired";
  txid?: string | null;
  createdAt: Date;
  expiresAt: Date;
  paidAt?: Date | null;
};

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  await connectDB();
  const orders = (await CryptoOrder.find().sort({ createdAt: -1 }).limit(200).lean()) as unknown as RawOrder[];

  const productIds = [...new Set(orders.map((o) => String(o.productId)))];
  const products = await Product.find({ _id: { $in: productIds } }).select("title").lean();
  const titles = new Map(products.map((p) => [String(p._id), p.title as string]));

  const now = Date.now();
  return NextResponse.json({
    orders: orders.map((o) => ({
      id: String(o._id),
      userId: o.userId,
      productTitle: titles.get(String(o.productId)) ?? "-",
      amount: (o.amountMicro / 1_000_000).toFixed(6),
      // A pending order past its expiry is shown as expired, even if no poll has saved it yet.
      status: o.status === "pending" && new Date(o.expiresAt).getTime() < now ? "expired" : o.status,
      txid: o.txid ?? null,
      createdAt: o.createdAt,
      expiresAt: o.expiresAt,
      paidAt: o.paidAt ?? null,
    })),
  });
}
