import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";

const COVER_BUCKET = "product-covers";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = ["png", "jpg", "jpeg", "webp"];

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "فایل الزامی است" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "حداکثر حجم تصویر ۵ مگابایت است" }, { status: 413 });
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXT.includes(ext)) {
    return NextResponse.json({ error: "فقط png, jpg, webp مجاز است" }, { status: 415 });
  }

  const key = `covers/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabaseAdmin.storage
    .from(COVER_BUCKET)
    .upload(key, file, { contentType: file.type || `image/${ext}`, upsert: false });
  if (error) {
    console.error("[cover upload]", error);
    return NextResponse.json({ error: "آپلود تصویر ناموفق بود" }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from(COVER_BUCKET).getPublicUrl(key);
  return NextResponse.json({ url: data.publicUrl }, { status: 201 });
}
