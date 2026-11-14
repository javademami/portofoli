import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Post } from "@/models/Post";

// Public list of published posts (no content body).
export async function GET() {
  await connectDB();
  const posts = await Post.find({ published: true })
    .select("title slug excerpt coverImage publishedAt")
    .sort({ publishedAt: -1 })
    .limit(100)
    .lean();
  return NextResponse.json({ posts });
}
