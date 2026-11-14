import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/mongodb";
import { supabaseAdmin, BUCKET } from "@/lib/supabase";
import { Product } from "@/models/Product";

const MAX_BYTES = 50 * 1024 * 1024;
const ALLOWED_EXT = ["pdf", "zip", "epub", "png", "jpg", "jpeg", "mp3", "mp4"];

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  await connectDB();
  const products = await Product.find().select("-fileKey").sort({ createdAt: -1 }).lean();
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const form = await req.formData();
  const title = String(form.get("title") ?? "").trim();
  const slug = slugify(String(form.get("slug") || title));
  const description = String(form.get("description") ?? "").trim();
  const priceSek = Number(form.get("priceSek"));
  const coverImage = String(form.get("coverImage") ?? "").trim() || undefined;
  const published = form.get("published") === "true";
  const file = form.get("file");

  if (!title || !slug || !description) {
    return NextResponse.json({ error: "عنوان، slug و توضیحات الزامی است" }, { status: 400 });
  }
  if (!Number.isFinite(priceSek) || priceSek < 0) {
    return NextResponse.json({ error: "قیمت نامعتبر است" }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "فایل الزامی است" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "حداکثر حجم فایل ۵۰ مگابایت است" }, { status: 413 });
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXT.includes(ext)) {
    return NextResponse.json({ error: "نوع فایل مجاز نیست" }, { status: 415 });
  }

  // Storage key is built from the slug and timestamp, never from the raw user filename.
    const key = `products/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  await connectDB();
  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(key, file, { contentType: file.type || "application/octet-stream", upsert: false });
  if (uploadError) {
    console.error("[supabase upload]", uploadError);
    return NextResponse.json({ error: "آپلود فایل ناموفق بود" }, { status: 500 });
  }

  try {
    const product = await Product.create({
      slug,
      title,
      description,
      priceSek,
      coverImage,
      published,
      fileKey: key,
      fileName: file.name,
    });
    return NextResponse.json({ id: String(product._id) }, { status: 201 });
  } catch (err: any) {
    console.error("[product create]", err);
    // Roll back the uploaded file if the database write failed.
    await supabaseAdmin.storage.from(BUCKET).remove([key]);
    if (err?.code === 11000) {
      return NextResponse.json({ error: "این slug قبلاً استفاده شده است" }, { status: 409 });
    }
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}