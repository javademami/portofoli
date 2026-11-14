import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Post } from "@/models/Post";

type Ctx = { params: Promise<{ slug: string }> };

// Public single post, only when published.
export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;

  await connectDB();
  const post = await Post.findOne({ slug, published: true })
    .select("title slug excerpt content coverImage publishedAt")
    .lean();
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({ post });
}
