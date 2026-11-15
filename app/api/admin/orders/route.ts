import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/mongodb";
import { formatUsdt } from "@/lib/crypto";
import { CryptoOrder } from "@/models/CryptoOrder";
import { Product } from "@/models/Product";

// Older orders stored a single `productId`; newer ones store `productIds`.
type RawOrder = {
  _id: Types.ObjectId;
  userId: string;
  productId?: Types.ObjectId | null;
  productIds?: Types.ObjectId[] | null;
  amountMicro: number;
  status: "pending" | "paid" | "expired";
  txid?: string | null;
  expiresAt: Date;
  paidAt?: Date | null;
  createdAt?: Date;
};

function productIdsOf(o: RawOrder): string[] {
  if (o.productIds && o.productIds.length > 0) return o.productIds.map(String);
  if (o.productId) return [String(o.productId)];
  return [];
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  await connectDB();
  const orders = (await CryptoOrder.find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .lean()) as unknown as RawOrder[];

  const ids = [...new Set(orders.flatMap(productIdsOf))];
  const products = await Product.find({ _id: { $in: ids } }).select("title").lean();
  const titleById = new Map(products.map((p) => [String(p._id), p.title]));

  const now = Date.now();
  return NextResponse.json({
    orders: orders.map((o) => ({
      id: String(o._id),
      userId: o.userId,
      productTitle: productIdsOf(o)
        .map((id) => titleById.get(id) ?? "—")
        .join(" + "),
      amount: formatUsdt(o.amountMicro),
      status: o.status === "pending" && new Date(o.expiresAt).getTime() < now ? "expired" : o.status,
      txid: o.txid ?? null,
      createdAt: o.createdAt ?? null,
      expiresAt: o.expiresAt,
      paidAt: o.paidAt ?? null,
    })),
  });
}
