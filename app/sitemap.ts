import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { Product } from "@/models/Product";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();
  const [posts, products] = await Promise.all([
    Post.find({ published: true }).select("slug updatedAt").lean(),
    Product.find({ published: true }).select("slug updatedAt").lean(),
  ]);

  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now },
    { url: `${BASE}/store`, lastModified: now },
    { url: `${BASE}/blog`, lastModified: now },
    ...posts.map((p) => ({ url: `${BASE}/blog/${p.slug}`, lastModified: p.updatedAt ?? now })),
    ...products.map((p) => ({ url: `${BASE}/store/${p.slug}`, lastModified: p.updatedAt ?? now })),
  ];
}
