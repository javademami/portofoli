import { Types } from "mongoose";
import { clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { sendEmail } from "@/lib/email";
import { Cart } from "@/models/Cart";
import { Product } from "@/models/Product";
import { Purchase } from "@/models/Purchase";

type PaidOrder = {
  _id: unknown;
  userId: string;
  productIds: Types.ObjectId[];
  txid?: string | null;
};

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

async function sendReceipt(userId: string, titles: string[]) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const to = user.primaryEmailAddress?.emailAddress;
  if (!to) return;

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const items = titles.map((t) => `<li>${escapeHtml(t)}</li>`).join("");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#111;max-width:560px">
      <h2>Thank you for your purchase</h2>
      <p>Your payment has been confirmed. Your files are ready to download:</p>
      <ul>${items}</ul>
      <p>
        <a href="${site}/dashboard/purchases" style="display:inline-block;background:#f59e0b;color:#111;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:bold">
          Go to my purchases
        </a>
      </p>
      <p style="color:#666;font-size:12px">Javad Emami · Medborgarplatsen 25, 118 72 Stockholm, Sweden</p>
    </div>`;

  await sendEmail(to, "Your purchase is ready", html);
}

// Creates one Purchase per product (with its USDT price), removes those products from the cart,
// and sends a receipt. Each Purchase has its own reference, so repeated calls do not duplicate it.
export async function fulfillCryptoOrder(order: PaidOrder) {
  await connectDB();

  const base = order.txid ? `crypto:${order.txid}` : `crypto-manual:${String(order._id)}`;
  const products = await Product.find({ _id: { $in: order.productIds } })
    .select("title priceUsdt")
    .lean();

  for (const p of products) {
    const ref = `${base}#${String(p._id)}`;
    await Purchase.updateOne(
      { stripeSessionId: ref },
      {
        $setOnInsert: {
          clerkUserId: order.userId,
          product: p._id,
          amountSek: 0,
          amountUsdt: p.priceUsdt ?? 0,
          status: "paid",
        },
      },
      { upsert: true }
    );
  }

  await Cart.updateOne(
    { clerkUserId: order.userId },
    { $pull: { products: { $in: order.productIds } } }
  );

  try {
    await sendReceipt(order.userId, products.map((p) => p.title));
  } catch (err) {
    console.error("receipt email failed", err);
  }
}
