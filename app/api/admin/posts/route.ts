import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/mongodb";
import { cleanText, makeSlug } from "@/lib/posts";
import { Post } from "@/models/Post";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  await connectDB();
  const posts = await Post.find({})
    .select("title slug published publishedAt createdAt coverImage")
    .sort({ createdAt: -1 })
    .limit(300)
    .lean();
  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const title = cleanText(body.title, 200);
  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const published = body.published === true;

  await connectDB();
  try {
    const post = await Post.create({
      title,
      slug: makeSlug(title, body.slug),
      excerpt: cleanText(body.excerpt, 500),
      content: cleanText(body.content, 50000),
      coverImage: cleanText(body.coverImage, 1000),
      published,
      publishedAt: published ? new Date() : null,
    });
    return NextResponse.json({ id: String(post._id) }, { status: 201 });
  } catch (e) {
    if ((e as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "slug already used" }, { status: 409 });
    }
    throw e;
  }
}
