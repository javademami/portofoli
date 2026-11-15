import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ORDER_TTL_MS, USDT_TRC20_CONTRACT } from "@/lib/crypto";
import { fetchIncomingUsdt } from "@/lib/tron";
import { fulfillCryptoOrder } from "@/lib/fulfill";
import { CryptoOrder } from "@/models/CryptoOrder";

export const dynamic = "force-dynamic";

// Checks pending and recently expired orders for incoming USDT. Called by Vercel Cron.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await connectDB();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const orders = await CryptoOrder.find({
    status: { $in: ["pending", "expired"] },
    expiresAt: { $gt: since },
  }).lean();

  let paid = 0;
  for (const order of orders) {
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
      if (!match) continue;

      const claimed = await CryptoOrder.findOneAndUpdate(
        { _id: order._id, status: { $in: ["pending", "expired"] } },
        { $set: { status: "paid", txid: match.transaction_id, paidAt: new Date() } },
        { new: true }
      ).lean();

      if (claimed) {
        await fulfillCryptoOrder(claimed);
        paid++;
      }
    } catch (err) {
      console.error("cron crypto check failed", String(order._id), err);
    }
  }

  return NextResponse.json({ checked: orders.length, paid });
}
