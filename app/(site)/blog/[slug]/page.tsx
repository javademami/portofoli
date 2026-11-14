import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import { Post } from "@/models/Post";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function getPost(slug: string) {
  await connectDB();
  return Post.findOne({ slug, published: true })
    .select("title slug excerpt content coverImage publishedAt")
    .lean();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found" };

  const description = post.excerpt || post.content.slice(0, 160);
  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const description = post.excerpt || post.content.slice(0, 160);
  const paragraphs = post.content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    image: post.coverImage || undefined,
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    author: { "@type": "Person", name: "Javad Emami" },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-zinc-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link href="/blog" className="text-sm text-zinc-400 hover:text-amber-300">
        ← Back to blog
      </Link>

      <article className="mt-6">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt={post.title} className="mb-8 h-72 w-full rounded-3xl object-cover" />
        )}
        {post.publishedAt && (
          <p className="text-xs text-zinc-500">
            {new Date(post.publishedAt).toLocaleDateString("en-GB", { dateStyle: "long" })}
          </p>
        )}
        <h1 className="mt-2 text-4xl font-semibold leading-tight">{post.title}</h1>
        {post.excerpt && <p className="mt-4 text-lg text-zinc-400">{post.excerpt}</p>}
        <div className="mt-8 space-y-5 text-base leading-relaxed text-zinc-200">
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}
