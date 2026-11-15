import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Cart } from "@/models/Cart";
import { Product } from "@/models/Product";

// The current user's cart with product details and total in USDT.
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  await connectDB();
  const cart = await Cart.findOne({ clerkUserId: userId }).lean();
  const ids = cart?.products ?? [];

  const items = await Product.find({ _id: { $in: ids }, published: true })
    .select("title slug priceUsdt coverImage")
    .lean();
  const totalUsdt = items.reduce((sum, p) => sum + (p.priceUsdt ?? 0), 0);

  return NextResponse.json({ items, totalUsdt });
}

// Adds a product to the cart. Products the user already owns are refused.
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const productId = typeof body.productId === "string" ? body.productId : "";
  if (!Types.ObjectId.isValid(productId)) {
    return NextResponse.json({ error: "invalid product" }, { status: 400 });
  }

  await connectDB();
  const product = await Product.findOne({ _id: productId, published: true }).select("_id priceUsdt").lean();
  if (!product) return NextResponse.json({ error: "product not found" }, { status: 404 });
  if (!(product.priceUsdt > 0)) {
    return NextResponse.json({ error: "product has no USDT price" }, { status: 409 });
  }

  const { Purchase } = await import("@/models/Purchase");
  const owned = await Purchase.exists({ clerkUserId: userId, product: product._id, status: "paid" });
  if (owned) return NextResponse.json({ error: "already owned" }, { status: 409 });

  await Cart.updateOne(
    { clerkUserId: userId },
    { $addToSet: { products: product._id } },
    { upsert: true }
  );

  return NextResponse.json({ ok: true }, { status: 201 });
}
