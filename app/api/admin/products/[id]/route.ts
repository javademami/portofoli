import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/mongodb";
import { cleanText, makeSlug } from "@/lib/posts";
import { supabaseAdmin, BUCKET } from "@/lib/supabase";
import { Product } from "@/models/Product";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  await connectDB();
  const product = await Product.findById(id)
    .select("title slug description priceUsdt coverImage fileName published")
    .lean();
  if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({ product });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));

  await connectDB();
  const product = await Product.findById(id);
  if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (typeof body.title === "string") {
    const title = cleanText(body.title, 200);
    if (!title) return NextResponse.json({ error: "عنوان الزامی است" }, { status: 400 });
    product.title = title;
  }
  if (typeof body.slug === "string" && body.slug.trim()) {
    product.slug = makeSlug(product.title, body.slug);
  }
  if (typeof body.description === "string") product.description = cleanText(body.description, 10000);
  if (body.priceUsdt !== undefined) {
    const price = Number(body.priceUsdt);
    if (!(price > 0)) {
      return NextResponse.json({ error: "قیمت باید بیشتر از صفر باشد" }, { status: 400 });
    }
    product.priceUsdt = price;
  }
  if (typeof body.coverImage === "string") product.coverImage = cleanText(body.coverImage, 1000);
  if (typeof body.published === "boolean") product.published = body.published;

  try {
    await product.save();
  } catch (e) {
    if ((e as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "این نشانی (slug) قبلاً استفاده شده" }, { status: 409 });
    }
    throw e;
  }

  return NextResponse.json({ ok: true });
}

// Permanently deletes the product and its file. To keep it without selling, unpublish it instead.
export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  await connectDB();
  const product = await Product.findById(id).select("+fileKey").lean();
  if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (product.fileKey) {
    const { error } = await supabaseAdmin.storage.from(BUCKET).remove([product.fileKey]);
    if (error) console.error("product file delete failed", error.message);
  }

  await Product.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}
