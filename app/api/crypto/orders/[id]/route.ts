import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { ORDER_TTL_MS, USDT_TRC20_CONTRACT, formatUsdt } from "@/lib/crypto";
import { fetchIncomingUsdt } from "@/lib/tron";
import { fulfillCryptoOrder } from "@/lib/fulfill";
import { CryptoOrder } from "@/models/CryptoOrder";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  await connectDB();
  const order = await CryptoOrder.findOne({ _id: id, userId }).lean();
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });

  let status = order.status;

  if (status === "pending" && order.expiresAt.getTime() < Date.now()) {
    await CryptoOrder.updateOne({ _id: order._id, status: "pending" }, { $set: { status: "expired" } });
    status = "expired";
  }

  // Pending orders are checked normally. Expired orders are checked too, so a late payment still counts.
  if (status === "pending" || status === "expired") {
    try {
      const transfers = await fetchIncomingUsdt(order.address, order.expiresAt.getTime() - ORDER_TTL_MS);
      const match = transfers.find(
        (t) =>
          t.to_address === order.address &&
          t.contract_address === USDT_TRC20_CONTRACT &&
          t.confirmed &&
          t.finalResult === "SUCCESS" &&
          !t.revert &&
          Number(t.quant) === order.amountMicro
      );

      if (match) {
        const claimed = await CryptoOrder.findOneAndUpdate(
          { _id: order._id, status: { $in: ["pending", "expired"] } },
          { $set: { status: "paid", txid: match.transaction_id, paidAt: new Date() } },
          { new: true }
        ).lean();

        if (claimed) {
          await fulfillCryptoOrder(claimed);
          status = "paid";
        }
      }
    } catch (err) {
      console.error("crypto order check failed", err);
    }
  }

  return NextResponse.json({
    status,
    productIds: (order.productIds ?? []).map(String),
    amount: formatUsdt(order.amountMicro),
    address: order.address,
    network: order.network,
    expiresAt: order.expiresAt,
  });
}
