import Link from "next/link";
import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import { Post } from "@/models/Post";
import Bi from "@/components/site/Bi";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes, projects and thoughts on product development, full-stack web development and digital products.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  await connectDB();
  const posts = await Post.find({ published: true })
    .select("title slug excerpt coverImage publishedAt")
    .sort({ publishedAt: -1 })
    .limit(100)
    .lean();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 text-zinc-100">
      <h1 className="text-3xl font-semibold">
        <Bi en="Blog" sv="Blogg" />
      </h1>
      <p className="mt-2 text-zinc-400">
        <Bi en="Notes, projects and thoughts." sv="Anteckningar, projekt och tankar." />
      </p>

      {posts.length === 0 && (
        <p className="mt-8 text-zinc-400">
          <Bi en="No posts yet." sv="Inga inlägg ännu." />
        </p>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {posts.map((p) => (
          <Link
            key={String(p._id)}
            href={`/blog/${p.slug}`}
            className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition hover:border-amber-400/40"
          >
            {p.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.coverImage} alt={p.title} className="h-48 w-full object-cover" />
            )}
            <div className="p-6">
              {p.publishedAt && (
                <p className="text-xs text-zinc-500">
                  {new Date(p.publishedAt).toLocaleDateString("en-GB", { dateStyle: "medium" })}
                </p>
              )}
              <h2 className="mt-2 text-xl font-medium group-hover:text-amber-300">{p.title}</h2>
              {p.excerpt && <p className="mt-2 text-sm text-zinc-400">{p.excerpt}</p>}
              <span className="mt-4 inline-block text-sm text-amber-300">
                <Bi en="Read more →" sv="Läs mer →" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
