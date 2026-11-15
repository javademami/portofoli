import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { ORDER_TTL_MS, randomSuffix } from "@/lib/crypto";
import { Cart } from "@/models/Cart";
import { Product } from "@/models/Product";
import { Purchase } from "@/models/Purchase";
import { CryptoOrder } from "@/models/CryptoOrder";

// Creates one USDT order for everything in the user's cart. Prices are in USDT.
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const address = process.env.CRYPTO_WALLET_ADDRESS;
  if (!address) return NextResponse.json({ error: "wallet not configured" }, { status: 500 });

  await connectDB();

  const cart = await Cart.findOne({ clerkUserId: userId }).lean();
  const cartIds = cart?.products ?? [];
  if (cartIds.length === 0) {
    return NextResponse.json({ error: "cart is empty" }, { status: 400 });
  }

  const products = await Product.find({ _id: { $in: cartIds }, published: true })
    .select("priceUsdt")
    .lean();
  if (products.length === 0) {
    return NextResponse.json({ error: "no available items" }, { status: 400 });
  }
  if (products.length !== cartIds.length) {
    return NextResponse.json({ error: "some items are no longer available" }, { status: 409 });
  }
  if (products.some((p) => !(p.priceUsdt > 0))) {
    return NextResponse.json({ error: "some items have no USDT price" }, { status: 409 });
  }

  const owned = await Purchase.exists({
    clerkUserId: userId,
    product: { $in: cartIds },
    status: "paid",
  });
  if (owned) {
    return NextResponse.json({ error: "already owned" }, { status: 409 });
  }

  // Total in micro-USDT (1 USDT = 1,000,000), plus a random suffix to tell orders apart.
  const baseMicro = products.reduce((sum, p) => sum + Math.round(p.priceUsdt * 1_000_000), 0);

  const now = new Date();
  for (let attempt = 0; attempt < 10; attempt++) {
    const amountMicro = baseMicro + randomSuffix();
    const taken = await CryptoOrder.exists({
      status: "pending",
      amountMicro,
      expiresAt: { $gt: now },
    });
    if (taken) continue;

    const order = await CryptoOrder.create({
      userId,
      productIds: products.map((p) => p._id),
      amountMicro,
      network: "TRC20",
      address,
      status: "pending",
      expiresAt: new Date(Date.now() + ORDER_TTL_MS),
    });
    return NextResponse.json({ id: String(order._id) }, { status: 201 });
  }

  return NextResponse.json({ error: "could not reserve an amount, try again" }, { status: 503 });
}
