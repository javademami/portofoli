import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/mongodb";
import { cleanText, makeSlug } from "@/lib/posts";
import { Collection } from "@/models/Collection";
import { Product } from "@/models/Product";

type Ctx = { params: Promise<{ id: string }> };

function notFound() {
  return NextResponse.json({ error: "not found" }, { status: 404 });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return notFound();

  const body = await req.json().catch(() => ({}));
  const update: Record<string, unknown> = {};

  if (typeof body.name === "string") {
    const name = cleanText(body.name, 120);
    if (!name) return NextResponse.json({ error: "نام مجموعه الزامی است" }, { status: 400 });
    update.name = name;
  }
  if (typeof body.slug === "string" && body.slug.trim()) {
    update.slug = makeSlug(String(update.name ?? body.name ?? "collection"), body.slug.trim());
  }
  if (typeof body.description === "string") update.description = cleanText(body.description, 2000);
  if (typeof body.coverImage === "string") update.coverImage = cleanText(body.coverImage, 1000);
  if (body.order !== undefined) update.order = Number(body.order) || 0;
  if (typeof body.published === "boolean") update.published = body.published;

  await connectDB();

  if (body.parent !== undefined) {
    const parent = /^[a-f0-9]{24}$/i.test(String(body.parent || "")) ? String(body.parent) : null;
    if (parent) {
      if (parent === id) {
        return NextResponse.json({ error: "مجموعه نمی‌تواند والد خودش باشد" }, { status: 400 });
      }
      if (!(await Collection.exists({ _id: parent }))) {
        return NextResponse.json({ error: "مجموعه والد پیدا نشد" }, { status: 400 });
      }
      let cursor: string | null = parent;
      for (let i = 0; cursor && i < 50; i++) {
        if (cursor === id) {
          return NextResponse.json({ error: "این تغییر باعث حلقه در ساختار مجموعه‌ها می‌شود" }, { status: 400 });
        }
        const node: { parent?: unknown } | null = await Collection.findById(cursor).select("parent").lean();
        if (!node) break;
        cursor = node.parent ? String(node.parent) : null;
      }
    }
    update.parent = parent;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  try {
    const updated = await Collection.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
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
  const children = await Collection.countDocuments({ parent: id });
  if (children > 0) {
    return NextResponse.json({ error: "ابتدا زیرمجموعه‌ها را حذف یا جابه‌جا کن" }, { status: 409 });
  }
  const products = await Product.countDocuments({ collection: id });
  if (products > 0) {
    return NextResponse.json({ error: "ابتدا محصولات این مجموعه را به مجموعه دیگری منتقل کن" }, { status: 409 });
  }

  await Collection.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}