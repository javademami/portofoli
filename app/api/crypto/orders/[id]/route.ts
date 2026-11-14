import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { CryptoOrder } from "@/models/CryptoOrder";
import { fetchIncomingUsdt } from "@/lib/tron";
import { USDT_TRC20_CONTRACT, formatUsdt } from "@/lib/crypto";
import { fulfillCryptoOrder } from "@/lib/fulfill";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  await connectDB();
  let order = await CryptoOrder.findOne({ _id: id, userId });
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (order.status === "pending") {
    if (order.expiresAt.getTime() < Date.now()) {
      order.status = "expired";
      await order.save();
    } else {
      try {
        const transfers = await fetchIncomingUsdt(order.address, order.createdAt.getTime());
        const match = transfers.find(
          (tx) =>
            tx.to_address === order!.address &&
            tx.contract_address === USDT_TRC20_CONTRACT &&
            tx.confirmed &&
            tx.finalResult === "SUCCESS" &&
            !tx.revert &&
            Number(tx.quant) === order!.amountMicro
        );

        if (match) {
          // Only one request can flip the order from pending to paid.
          const claimed = await CryptoOrder.findOneAndUpdate(
            { _id: order._id, status: "pending" },
            { status: "paid", txid: match.transaction_id, paidAt: new Date() },
            { new: true }
          ).catch(() => null); // a duplicate txid ends up here

          if (claimed) {
            await fulfillCryptoOrder(claimed);
            order = claimed;
          }
        }
      } catch (err) {
        // Tronscan hiccup: keep the order pending and let the next poll retry.
        console.error("[crypto verify]", err);
      }
    }
  }

  return NextResponse.json({
    status: order.status,
    productId: String(order.productId),
    amount: formatUsdt(order.amountMicro),
    address: order.address,
    network: order.network,
    expiresAt: order.expiresAt,
  });
}
