import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  await connectDB();
  const total = await Product.countDocuments();
  const published = await Product.countDocuments({ published: true });
  return NextResponse.json({ products: { total, published, draft: total - published } });
}