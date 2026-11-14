"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";

export type PostInitial = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  published: boolean;
};

const EMPTY: PostInitial = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  published: false,
};

const INPUT =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 outline-none focus:border-amber-400/60";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm text-zinc-300">{label}</span>
      {children}
    </label>
  );
}

export default function PostForm({ postId, initial = EMPTY }: { postId?: string; initial?: PostInitial }) {
  const router = useRouter();
  const [form, setForm] = useState<PostInitial>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof PostInitial>(key: K, value: PostInitial[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadCover(file: File) {
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/posts/cover", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "آپلود کاور ناموفق بود");
        return;
      }
      set("coverImage", data.url);
    } catch {
      setError("خطا در آپلود تصویر");
    } finally {
      setBusy(false);
    }
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch(postId ? `/api/admin/posts/${postId}` : "/api/admin/posts", {
        method: postId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(res.status === 409 ? "این نشانی (slug) قبلاً استفاده شده" : data.error ?? "ذخیره ناموفق بود");
        return;
      }
      router.push("/admin/posts");
      router.refresh();
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} dir="rtl" className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
      <Field label="عنوان">
        <input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          maxLength={200}
          required
          className={INPUT}
        />
      </Field>

      <Field label="نشانی (slug) - اختیاری، در صورت خالی بودن از عنوان ساخته می‌شود">
        <input
          value={form.slug}
          onChange={(e) => set("slug", e.target.value)}
          maxLength={120}
          dir="ltr"
          className={INPUT}
        />
      </Field>

      <Field label="خلاصه">
        <textarea
          value={form.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
          maxLength={500}
          rows={3}
          className={INPUT}
        />
      </Field>

      <div className="space-y-2">
        <span className="block text-sm text-zinc-300">تصویر کاور</span>
        <div className="flex flex-wrap items-center gap-4">
          {form.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.coverImage} alt="" className="h-24 w-40 rounded-2xl object-cover" />
          )}
          <label className="cursor-pointer rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm hover:border-amber-400/40">
            {busy ? "در حال آپلود…" : "انتخاب تصویر"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadCover(f);
                e.target.value = "";
              }}
            />
          </label>
          {form.coverImage && (
            <button
              type="button"
              onClick={() => set("coverImage", "")}
              className="text-sm text-zinc-400 hover:text-red-400"
            >
              حذف تصویر
            </button>
          )}
        </div>
      </div>

      <Field label="متن پست">
        <textarea
          value={form.content}
          onChange={(e) => set("content", e.target.value)}
          rows={16}
          className={INPUT}
        />
        <p className="text-xs text-zinc-500">برای شروع پاراگراف جدید یک خط خالی بگذارید.</p>
      </Field>

      <label className="flex items-center gap-3 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => set("published", e.target.checked)}
          className="h-4 w-4 accent-amber-400"
        />
        منتشر شود
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-amber-400 px-6 py-2.5 text-sm font-medium text-zinc-900 hover:bg-amber-300 disabled:opacity-60"
        >
          {busy ? "در حال ذخیره…" : postId ? "ذخیره تغییرات" : "ایجاد پست"}
        </button>
        <Link
          href="/admin/posts"
          className="rounded-full border border-white/10 px-6 py-2.5 text-sm text-zinc-300 hover:border-white/30"
        >
          انصراف
        </Link>
      </div>
    </form>
  );
}
