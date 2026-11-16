"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import CoverUpload from "@/components/admin/CoverUpload";

type Col = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  parent?: string | null;
  order: number;
  published: boolean;
  productCount: number;
};

const inputClass =
  "w-full rounded-full border border-zinc-700/80 bg-[#161B26] px-5 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400";
const labelClass = "mb-1.5 block text-xs font-medium text-zinc-400";

export default function AdminCollectionsPage() {
  const [cols, setCols] = useState<Col[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parent, setParent] = useState("");
  const [order, setOrder] = useState("0");
  const [cover, setCover] = useState("");
  const [published, setPublished] = useState(true);

  const map = useMemo(() => new Map(cols.map((c) => [c._id, c])), [cols]);

  const ordered = useMemo(() => {
    const out: (Col & { depth: number })[] = [];
    const childrenOf = (pid: string | null) =>
      cols
        .filter((c) => (pid === null ? !c.parent || !map.has(c.parent) : c.parent === pid))
        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
    const walk = (pid: string | null, depth: number) => {
      for (const c of childrenOf(pid)) {
        out.push({ ...c, depth });
        walk(c._id, depth + 1);
      }
    };
    walk(null, 0);
    return out;
  }, [cols, map]);

  async function load() {
    const res = await fetch("/api/admin/collections", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setCols(data.collections ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setParent("");
    setOrder("0");
    setCover("");
    setPublished(true);
    setError(null);
  }

  function startEdit(c: Col) {
    setEditingId(c._id);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description ?? "");
    setParent(c.parent ?? "");
    setOrder(String(c.order));
    setCover(c.coverImage ?? "");
    setPublished(c.published);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(editingId ? `/api/admin/collections/${editingId}` : "/api/admin/collections", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          parent: parent || null,
          order: Number(order) || 0,
          coverImage: cover,
          published,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "خطا در ذخیره");
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(c: Col) {
    await fetch(`/api/admin/collections/${c._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !c.published }),
    });
    await load();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) setError(json.error || "حذف ناموفق بود");
    setConfirmId(null);
    await load();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <h1 className="text-3xl font-extrabold">مجموعه‌ها</h1>

      <form onSubmit={submit} className="space-y-5 rounded-3xl border border-zinc-800 bg-[#11141D] p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{editingId ? "ویرایش مجموعه" : "مجموعه جدید"}</h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-sm text-zinc-400 hover:text-white">
              انصراف
            </button>
          )}
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>نام</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Slug (اختیاری)</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>مجموعه والد</label>
            <select
              value={parent}
              onChange={(e) => setParent(e.target.value)}
              className={inputClass}
            >
              <option value="">— بدون والد (سطح اول)</option>
              {ordered
                .filter((c) => c._id !== editingId)
                .map((c) => (
                  <option key={c._id} value={c._id}>
                    {"— ".repeat(c.depth)}
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>ترتیب نمایش (عدد کوچک‌تر، جلوتر)</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>توضیحات</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full resize-y rounded-2xl border border-zinc-700/80 bg-[#161B26] px-5 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>تصویر کاور</label>
            <CoverUpload value={cover} onChange={setCover} />
          </div>
          <label className="flex cursor-pointer items-center gap-3 self-start pt-6">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 accent-amber-500"
            />
            <span className="text-sm text-zinc-300">منتشر شود</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-60"
        >
          {busy ? "در حال ذخیره…" : editingId ? "ذخیره تغییرات" : "ساخت مجموعه"}
        </button>
      </form>

      {loading ? (
        <p className="text-zinc-400">در حال بارگذاری…</p>
      ) : ordered.length === 0 ? (
        <p className="text-zinc-400">هنوز مجموعه‌ای ساخته نشده.</p>
      ) : (
        <ul className="space-y-2">
          {ordered.map((c) => (
            <li
              key={c._id}
              style={{ paddingRight: `${c.depth * 24 + 16}px` }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 py-3 pl-4"
            >
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-zinc-500">
                  {c.slug} · {c.productCount} محصول
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={c.published ? "text-emerald-300" : "text-zinc-500"}>
                  {c.published ? "منتشر شده" : "پیش‌نویس"}
                </span>
                <button type="button" onClick={() => togglePublished(c)} className="rounded-full bg-white/10 px-3 py-1">
                  {c.published ? "عدم انتشار" : "انتشار"}
                </button>
                <button type="button" onClick={() => startEdit(c)} className="rounded-full bg-white/10 px-3 py-1">
                  ویرایش
                </button>
                {confirmId === c._id ? (
                  <>
                    <button type="button" onClick={() => remove(c._id)} className="rounded-full bg-rose-500/20 px-3 py-1 text-rose-300">
                      تأیید حذف
                    </button>
                    <button type="button" onClick={() => setConfirmId(null)} className="rounded-full bg-white/10 px-3 py-1">
                      انصراف
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => setConfirmId(c._id)} className="rounded-full bg-white/10 px-3 py-1 hover:text-rose-300">
                    حذف
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}