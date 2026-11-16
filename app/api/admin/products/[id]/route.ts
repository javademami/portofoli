import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/mongodb";
import { cleanText, makeSlug } from "@/lib/posts";
import { toFaq, toGallery } from "@/lib/products";
import { BUCKET, supabaseAdmin } from "@/lib/supabase";
import { Product } from "@/models/Product";

type Ctx = { params: Promise<{ id: string }> };

function notFound() {
  return NextResponse.json({ error: "not found" }, { status: 404 });
}

export async function GET(_req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return notFound();

  await connectDB();
  const product = await Product.findById(id).lean();
  if (!product) return notFound();
  return NextResponse.json({ product });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return notFound();

  const body = await req.json().catch(() => ({}));
  const update: Record<string, unknown> = {};

  if (typeof body.title === "string") {
    const title = cleanText(body.title, 200);
    if (!title) return NextResponse.json({ error: "عنوان نمی‌تواند خالی باشد" }, { status: 400 });
    update.title = title;
  }
  if (typeof body.slug === "string" && body.slug.trim()) {
    update.slug = makeSlug(String(update.title ?? body.title ?? "product"), body.slug.trim());
  }
  if (typeof body.description === "string") {
    update.description = cleanText(body.description, 5000);
  }
  if (body.priceUsdt !== undefined) {
    const price = Number(body.priceUsdt);
    if (!(price > 0)) {
      return NextResponse.json({ error: "قیمت باید بیشتر از صفر باشد" }, { status: 400 });
    }
    update.priceUsdt = price;
  }
  if (typeof body.coverImage === "string") {
    update.coverImage = cleanText(body.coverImage, 1000);
  }
  if (body.gallery !== undefined) update.gallery = toGallery(body.gallery);
  if (body.faq !== undefined) update.faq = toFaq(body.faq);
  if (typeof body.published === "boolean") update.published = body.published; if (typeof body.demoUrl === "string") update.demoUrl = body.demoUrl.trim().slice(0, 500);
  if (body.collection !== undefined) {
    update.collection = /^[a-f0-9]{24}$/i.test(String(body.collection || "")) ? String(body.collection) : null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  await connectDB();
  try {
    const updated = await Product.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
    if (!updated) return notFound();
    return NextResponse.json({ ok: true });
  } catch (e) {
    if ((e as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "این slug قبلاً استفاده شده است" }, { status: 409 });
    }
    throw e;
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return notFound();

  await connectDB();
  const product = await Product.findById(id).select("+fileKey").lean();
  if (!product) return notFound();

  await Product.deleteOne({ _id: id });
  if (product.fileKey) {
    await supabaseAdmin.storage.from(BUCKET).remove([product.fileKey]);
  }
  return NextResponse.json({ ok: true });
}