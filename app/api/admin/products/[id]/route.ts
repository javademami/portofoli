import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/mongodb";
import { supabaseAdmin, BUCKET } from "@/lib/supabase";
import { Product } from "@/models/Product";
import { slugify } from "../route";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "id نامعتبر است" }, { status: 400 });
  }
  await connectDB();
  const product = await Product.findById(id).select("-fileKey").lean();
  if (!product) return NextResponse.json({ error: "پیدا نشد" }, { status: 404 });
  return NextResponse.json({ product });
}

// Metadata only. Replacing the file is a separate step we can add later.
export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "id نامعتبر است" }, { status: 400 });
  }

  const body = await req.json();
  const update: Record<string, unknown> = {};
  if (typeof body.title === "string") update.title = body.title.trim();
  if (typeof body.slug === "string") update.slug = slugify(body.slug);
  if (typeof body.description === "string") update.description = body.description.trim();
  if (typeof body.priceSek === "number" && body.priceSek >= 0) update.priceSek = body.priceSek;
  if (typeof body.coverImage === "string") update.coverImage = body.coverImage.trim() || undefined;
  if (typeof body.published === "boolean") update.published = body.published;

  await connectDB();
  try {
    const product = await Product.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).select("-fileKey");
    if (!product) return NextResponse.json({ error: "پیدا نشد" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.code === 11000) {
      return NextResponse.json({ error: "این slug تکراری است" }, { status: 409 });
    }
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "id نامعتبر است" }, { status: 400 });
  }

  await connectDB();
  const product = await Product.findById(id).select("+fileKey");
  if (!product) return NextResponse.json({ error: "پیدا نشد" }, { status: 404 });

  await supabaseAdmin.storage.from(BUCKET).remove([product.fileKey]);
  await product.deleteOne();
  return NextResponse.json({ ok: true });
}