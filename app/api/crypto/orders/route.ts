import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { CryptoOrder } from "@/models/CryptoOrder";
import { priceToBaseMicro, randomSuffix, ORDER_TTL_MS } from "@/lib/crypto";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { productId } = await req.json();
  if (!Types.ObjectId.isValid(productId)) {
    return NextResponse.json({ error: "invalid product" }, { status: 400 });
  }

  const address = process.env.CRYPTO_WALLET_ADDRESS;
  if (!address) {
    return NextResponse.json({ error: "wallet not configured" }, { status: 500 });
  }

  await connectDB();
  const product = await Product.findOne({ _id: productId, published: true }).select("priceSek");
  if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });

  const now = new Date();
  const base = priceToBaseMicro(product.priceSek);

  // Pick an amount that no open order is using right now.
  let amountMicro = 0;
  for (let attempt = 0; attempt < 10 && !amountMicro; attempt++) {
    const candidate = base + randomSuffix();
    const taken = await CryptoOrder.exists({
      status: "pending",
      amountMicro: candidate,
      expiresAt: { $gt: now },
    });
    if (!taken) amountMicro = candidate;
  }
  if (!amountMicro) {
    return NextResponse.json({ error: "busy, try again" }, { status: 503 });
  }

  const order = await CryptoOrder.create({
    userId,
    productId,
    amountMicro,
    address,
    expiresAt: new Date(now.getTime() + ORDER_TTL_MS),
  });

  return NextResponse.json({ id: String(order._id) }, { status: 201 });
}
