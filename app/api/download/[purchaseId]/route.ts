import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { supabaseAdmin, BUCKET } from "@/lib/supabase";
import { Purchase } from "@/models/Purchase";
import { Product } from "@/models/Product";

type Ctx = { params: Promise<{ purchaseId: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { purchaseId } = await params;
  if (!Types.ObjectId.isValid(purchaseId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  await connectDB();

  // The purchase must belong to this user and be paid.
  const purchase = await Purchase.findOne({ _id: purchaseId, clerkUserId: userId, status: "paid" }).lean();
  if (!purchase) return NextResponse.json({ error: "not found" }, { status: 404 });

  const product = await Product.findById(purchase.product).select("+fileKey fileName").lean();
  if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Short-lived signed link: 60 seconds, downloads with the original file name.
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(product.fileKey, 60, { download: product.fileName });

  if (error || !data) {
    console.error("[download sign]", error);
    return NextResponse.json({ error: "file unavailable" }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
