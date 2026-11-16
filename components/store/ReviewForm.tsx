"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Bi from "@/components/site/Bi";

export default function ReviewForm({
  productId,
  signedIn,
  purchased,
  canReview,
}: {
  productId: string;
  signedIn: boolean;
  purchased: boolean;
  canReview: boolean;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!signedIn) {
    return (
      <p className="text-sm text-white/60">
        <Link href="/sign-in" className="text-amber-400 underline">
          <Bi en="Sign in to leave a review" sv="Logga in för att recensera" />
        </Link>
      </p>
    );
  }
  if (!purchased) {
    return (
      <p className="text-sm text-white/60">
        <Bi en="Only buyers can leave a review." sv="Endast köpare kan lämna en recension." />
      </p>
    );
  }
  if (!canReview) {
    return (
      <p className="text-sm text-white/60">
        <Bi en="You have already reviewed this product." sv="Du har redan recenserat produkten." />
      </p>
    );
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, body }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "خطا در ثبت نظر");
      setBody("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ثبت نظر");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`text-2xl ${n <= rating ? "text-amber-400" : "text-white/20"}`}
            aria-label={`${n} stars`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="نظر شما"
        className="w-full resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm outline-none focus:border-amber-400"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-amber-400 px-6 py-2 text-sm font-medium text-black disabled:opacity-50"
      >
        <Bi en="Submit review" sv="Skicka recension" />
      </button>
    </form>
  );
}