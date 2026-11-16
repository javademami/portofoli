import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body.ids)
    ? body.ids.map(String).filter((id: string) => mongoose.isValidObjectId(id)).slice(0, 100)
    : [];
  if (ids.length === 0) return NextResponse.json({ items: [] });

  await connectDB();
  const products = await Product.find({ _id: { $in: ids }, published: true, priceUsdt: { $gt: 0 } })
    .select("title slug priceUsdt coverImage")
    .lean();

  return NextResponse.json({
    items: products.map((p) => ({
      _id: String(p._id),
      title: p.title,
      slug: p.slug,
      priceUsdt: p.priceUsdt,
      coverImage: p.coverImage ?? "",
    })),
  });
}