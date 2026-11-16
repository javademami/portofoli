import mongoose from "mongoose";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ORDER_TTL_MS, randomSuffix } from "@/lib/crypto";
import { Cart } from "@/models/Cart";
import { Coupon } from "@/models/Coupon";
import { CryptoOrder } from "@/models/CryptoOrder";
import { Product } from "@/models/Product";
import { Purchase } from "@/models/Purchase";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const address = process.env.CRYPTO_WALLET_ADDRESS;
  if (!address) return NextResponse.json({ error: "wallet not configured" }, { status: 500 });

  const body = await req.json().catch(() => ({}));
  await connectDB();

  let productIds: string[] = Array.isArray(body.productIds)
    ? body.productIds.map(String).filter((id: string) => mongoose.isValidObjectId(id))
    : [];
  const fromServerCart = productIds.length === 0;
  if (fromServerCart) {
    const cart = await Cart.findOne({ clerkUserId: userId }).lean();
    productIds = (cart?.products ?? []).map(String);
  }
  productIds = Array.from(new Set(productIds));
  if (productIds.length === 0) {
    return NextResponse.json({ error: "سبد خرید خالی است" }, { status: 400 });
  }

  const products = await Product.find({ _id: { $in: productIds }, published: true, priceUsdt: { $gt: 0 } })
    .select("priceUsdt")
    .lean();
  if (products.length !== productIds.length) {
    return NextResponse.json({ error: "برخی محصولات دیگر در دسترس نیستند" }, { status: 400 });
  }

  const owned = await Purchase.exists({ clerkUserId: userId, product: { $in: productIds }, status: "paid" });
  if (owned) {
    return NextResponse.json({ error: "برخی محصولات را قبلاً خریده‌اید" }, { status: 409 });
  }

  const totalMicro = Math.round(products.reduce((s, p) => s + Number(p.priceUsdt), 0) * 1_000_000);

  let discountPercent = 0;
  let couponCode: string | undefined;
  let couponId: unknown = null;
  const code = typeof body.couponCode === "string" ? body.couponCode.trim().toUpperCase() : "";
  if (code) {
    const coupon = await Coupon.findOne({ code }).lean();
    const valid =
      coupon &&
      coupon.active &&
      (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
      (coupon.maxUses === 0 || coupon.usedCount < coupon.maxUses);
    if (!valid || !coupon) {
      return NextResponse.json({ error: "کد تخفیف معتبر نیست" }, { status: 400 });
    }
    discountPercent = coupon.percentOff;
    couponCode = coupon.code;
    couponId = coupon._id;
  }

  const baseMicro = Math.round((totalMicro * (100 - discountPercent)) / 100);

  let amountMicro = 0;
  for (let i = 0; i < 20 && !amountMicro; i++) {
    const candidate = baseMicro + randomSuffix();
    const clash = await CryptoOrder.exists({ status: "pending", amountMicro: candidate });
    if (!clash) amountMicro = candidate;
  }
  if (!amountMicro) {
    return NextResponse.json({ error: "لطفاً دوباره تلاش کنید" }, { status: 503 });
  }

  const order = await CryptoOrder.create({
    userId,
    productIds,
    amountMicro,
    couponCode,
    discountPercent,
    network: "TRC20",
    address,
    status: "pending",
    expiresAt: new Date(Date.now() + ORDER_TTL_MS),
  });

  if (couponId) {
    await Coupon.updateOne({ _id: couponId }, { $inc: { usedCount: 1 } });
  }
  if (fromServerCart) {
    await Cart.updateOne({ clerkUserId: userId }, { $set: { products: [] } });
  }

  return NextResponse.json({ id: String(order._id) }, { status: 201 });
}