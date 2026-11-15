import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/mongodb";
import { cleanText, makeSlug } from "@/lib/posts";
import { supabaseAdmin, BUCKET } from "@/lib/supabase";
import { Product } from "@/models/Product";

const MAX_FILE_BYTES = 50 * 1024 * 1024;

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  await connectDB();
  const products = await Product.find({})
    .select("title slug priceUsdt published fileName coverImage createdAt")
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json({ products });
}

// Creates a product: uploads the private file to Supabase and stores its key.
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const form = await req.formData();
  const title = cleanText(form.get("title"), 200);
  if (!title) return NextResponse.json({ error: "عنوان الزامی است" }, { status: 400 });

  const priceUsdt = Number(form.get("priceUsdt"));
  if (!(priceUsdt > 0)) {
    return NextResponse.json({ error: "قیمت باید بیشتر از صفر باشد" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "فایل محصول الزامی است" }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "حجم فایل بیشتر از ۵۰ مگابایت است" }, { status: 413 });
  }

  const ext = ((file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "")) || "bin";
  const key = `products/${Date.now()}-${randomUUID()}.${ext}`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(key, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  await connectDB();
  try {
    const product = await Product.create({
      title,
      slug: makeSlug(title, form.get("slug")),
      description: cleanText(form.get("description"), 10000),
      priceUsdt,
      priceSek: 0,
      coverImage: cleanText(form.get("coverImage"), 1000),
      fileKey: key,
      fileName: file.name,
      published: form.get("published") === "true",
    });
    return NextResponse.json({ id: String(product._id) }, { status: 201 });
  } catch (e) {
    if ((e as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "این نشانی (slug) قبلاً استفاده شده" }, { status: 409 });
    }
    throw e;
  }
}
