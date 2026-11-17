import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();
  const products = await Product.find({ published: true })
    .sort({ createdAt: -1 })
    .limit(6)
    .select("title slug priceUsdt coverImage")
    .lean();

  return NextResponse.json({
    products: products.map((p) => ({
      id: String(p._id),
      title: p.title,
      slug: p.slug,
      priceUsdt: Number(p.priceUsdt),
      coverImage: p.coverImage || "",
    })),
  });
}