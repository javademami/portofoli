import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/mongodb";
import { makeSlug, cleanText } from "@/lib/posts";
import { toFaq, toGallery } from "@/lib/products";
import { BUCKET, supabaseAdmin } from "@/lib/supabase";
import { Product } from "@/models/Product";

const MAX_FILE_BYTES = 50 * 1024 * 1024;

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  await connectDB();
  const products = await Product.find({})
    .select("title slug published priceUsdt coverImage createdAt")
    .sort({ createdAt: -1 })
    .limit(300)
    .lean();
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const data = await req.formData();

  const title = cleanText(String(data.get("title") ?? ""), 200);
  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const description = cleanText(String(data.get("description") ?? ""), 5000);

  const priceUsdt = Number(data.get("priceUsdt"));
  if (!(priceUsdt > 0)) {
    return NextResponse.json({ error: "قیمت باید بیشتر از صفر باشد" }, { status: 400 });
  }

  const file = data.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "فایل محصول الزامی است" }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "حجم فایل بیشتر از ۵۰ مگابایت است" }, { status: 400 });
  }

  const givenSlug = String(data.get("slug") ?? "").trim() || undefined;
  const slug = makeSlug(title, givenSlug);

  const ext = (file.name.split(".").pop() || "bin").replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 10) || "bin";
  const key = `products/${Date.now()}-${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(key, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (uploadError) {
    return NextResponse.json({ error: "آپلود فایل ناموفق بود" }, { status: 500 });
  }

  await connectDB();
  try {
    const product = await Product.create({
      title,
      slug,
      description,
      priceUsdt,
      priceSek: 0,
      coverImage: cleanText(String(data.get("coverImage") ?? ""), 1000),
      gallery: toGallery(data.get("gallery")),
      faq: toFaq(data.get("faq")),
      collection: /^[a-f0-9]{24}$/i.test(String(data.get("collection") || "")) ? String(data.get("collection")) : null,
      fileKey: key,
      fileName: String(data.get("fileName") || file.name).slice(0, 255),
      fileFormat: String(data.get("fileFormat") || ext).slice(0, 20),
      fileSize: Number(data.get("fileSize")) || file.size,
      published: data.get("published") === "true", demoUrl: String(data.get("demoUrl") || "").trim().slice(0, 500),
    });
    return NextResponse.json({ id: String(product._id), slug: product.slug }, { status: 201 });
  } catch (e) {
    await supabaseAdmin.storage.from(BUCKET).remove([key]);
    if ((e as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "این slug قبلاً استفاده شده است" }, { status: 409 });
    }
    throw e;
  }
}