import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/mongodb";
import { cleanText, makeSlug } from "@/lib/posts";
import { Post } from "@/models/Post";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  await connectDB();
  const post = await Post.findById(id).lean();
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({ post });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));

  await connectDB();
  const post = await Post.findById(id);
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (typeof body.title === "string") {
    const title = cleanText(body.title, 200);
    if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });
    post.title = title;
  }
  if (typeof body.slug === "string" && body.slug.trim()) {
    post.slug = makeSlug(post.title, body.slug);
  }
  if (typeof body.excerpt === "string") post.excerpt = cleanText(body.excerpt, 500);
  if (typeof body.content === "string") post.content = cleanText(body.content, 50000);
  if (typeof body.coverImage === "string") post.coverImage = cleanText(body.coverImage, 1000);
  if (typeof body.published === "boolean") {
    post.published = body.published;
    if (body.published && !post.publishedAt) post.publishedAt = new Date();
  }

  try {
    await post.save();
  } catch (e) {
    if ((e as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "slug already used" }, { status: 409 });
    }
    throw e;
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  await connectDB();
  const removed = await Post.findByIdAndDelete(id);
  if (!removed) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
