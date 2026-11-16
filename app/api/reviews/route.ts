import mongoose from "mongoose";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { cleanText } from "@/lib/posts";
import { Purchase } from "@/models/Purchase";
import { Review } from "@/models/Review";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const productId = String(body.productId ?? "");
  const rating = Number(body.rating);
  const text = cleanText(String(body.body ?? ""), 2000);

  if (!mongoose.isValidObjectId(productId)) {
    return NextResponse.json({ error: "invalid product" }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "امتیاز باید بین ۱ و ۵ باشد" }, { status: 400 });
  }

  await connectDB();
  const owned = await Purchase.exists({ clerkUserId: userId, product: productId, status: "paid" });
  if (!owned) {
    return NextResponse.json({ error: "فقط خریداران می‌توانند نظر بدهند" }, { status: 403 });
  }

  const user = await currentUser();
  const authorName = cleanText(user?.firstName ?? "کاربر", 80) || "کاربر";

  try {
    await Review.create({ product: productId, clerkUserId: userId, authorName, rating, body: text });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    if ((e as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "شما قبلاً برای این محصول نظر داده‌اید" }, { status: 409 });
    }
    throw e;
  }
}