"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PostForm, { type PostInitial } from "@/components/admin/PostForm";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const [initial, setInitial] = useState<PostInitial | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/posts/${id}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("failed");
        return r.json();
      })
      .then((d) => {
        if (cancelled) return;
        const p = d.post;
        setInitial({
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt ?? "",
          content: p.content ?? "",
          coverImage: p.coverImage ?? "",
          published: !!p.published,
        });
      })
      .catch(() => {
        if (!cancelled) setError("پست پیدا نشد");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div dir="rtl" className="space-y-6">
      <h1 className="text-2xl font-semibold">ویرایش پست</h1>
      {error && <p className="text-red-400">{error}</p>}
      {!initial && !error && <p className="text-zinc-400">در حال بارگذاری…</p>}
      {initial && <PostForm key={id} postId={id} initial={initial} />}
    </div>
  );
}
