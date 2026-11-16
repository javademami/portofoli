import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/mongodb";
import { cleanText, makeSlug } from "@/lib/posts";
import { Collection } from "@/models/Collection";
import { Product } from "@/models/Product";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  await connectDB();
  const collections = await Collection.find({}).sort({ order: 1, name: 1 }).lean();
  const counts = await Product.aggregate([
    { $match: { collection: { $ne: null } } },
    { $group: { _id: "$collection", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count as number]));

  return NextResponse.json({
    collections: collections.map((c) => ({
      ...c,
      productCount: countMap.get(String(c._id)) ?? 0,
    })),
  });
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const name = cleanText(String(body.name ?? ""), 120);
  if (!name) return NextResponse.json({ error: "نام مجموعه الزامی است" }, { status: 400 });

  const parent = /^[a-f0-9]{24}$/i.test(String(body.parent ?? "")) ? String(body.parent) : null;

  await connectDB();
  if (parent && !(await Collection.exists({ _id: parent }))) {
    return NextResponse.json({ error: "مجموعه والد پیدا نشد" }, { status: 400 });
  }

  try {
    const collection = await Collection.create({
      name,
      slug: makeSlug(name, String(body.slug ?? "").trim() || undefined),
      description: cleanText(String(body.description ?? ""), 2000),
      coverImage: cleanText(String(body.coverImage ?? ""), 1000),
      parent,
      order: Number(body.order) || 0,
      published: body.published !== false,
    });
    return NextResponse.json({ id: String(collection._id) }, { status: 201 });
  } catch (e) {
    if ((e as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "این slug قبلاً استفاده شده است" }, { status: 409 });
    }
    throw e;
  }
}