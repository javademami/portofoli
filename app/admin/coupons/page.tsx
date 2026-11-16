"use client";

import { useEffect, useState } from "react";

type Coupon = {
  _id: string;
  code: string;
  percentOff: number;
  maxUses: number;
  usedCount: number;
  expiresAt?: string | null;
  active: boolean;
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("");
  const [maxUses, setMaxUses] = useState("0");
  const [expiresAt, setExpiresAt] = useState("");

  async function load() {
    const res = await fetch("/api/admin/coupons", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setCoupons(data.coupons ?? []);
    } else {
      setError("بارگذاری کدهای تخفیف ناموفق بود");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          percentOff: Number(percent),
          maxUses: Number(maxUses || 0),
          expiresAt: expiresAt || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "ساخت کد ناموفق بود");
        return;
      }
      setCode("");
      setPercent("");
      setMaxUses("0");
      setExpiresAt("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function toggle(c: Coupon) {
    await fetch(`/api/admin/coupons/${c._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    setConfirmId(null);
    await load();
  }

  return (
    <div dir="rtl" className="space-y-8">
      <h1 className="text-2xl font-bold">کدهای تخفیف</h1>
      <div className="space-y-1 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
        <p>کد: ۳ تا ۳۲ کاراکتر، فقط حروف انگلیسی، عدد، _ و -</p>
        <p>درصد تخفیف: عدد صحیح بین ۱ و ۱۰۰</p>
        <p>سقف استفاده: ۰ یعنی نامحدود</p>
        <p>تاریخ انقضا: اختیاری. خالی بماند یعنی بدون انقضا</p>
      </div>

      <form onSubmit={create} className="grid gap-3 rounded-xl border border-white/10 p-4 md:grid-cols-5">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="کد (مثلاً SUMMER25)"
          required
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 uppercase"
        />
        <input
          type="number"
          min={1}
          max={100}
          value={percent}
          onChange={(e) => setPercent(e.target.value)}
          placeholder="درصد تخفیف"
          required
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2"
        />
        <input
          type="number"
          min={0}
          value={maxUses}
          onChange={(e) => setMaxUses(e.target.value)}
          placeholder="سقف استفاده (۰ = نامحدود)"
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2"
        />
        <input
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-amber-400 px-4 py-2 font-medium text-black disabled:opacity-50"
        >
          ساخت کد
        </button>
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading ? (
        <p className="text-white/50">در حال بارگذاری...</p>
      ) : coupons.length === 0 ? (
        <p className="text-white/50">هنوز کدی ساخته نشده.</p>
      ) : (
        <ul className="space-y-3">
          {coupons.map((c) => (
            <li
              key={c._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 p-4"
            >
              <div>
                <div className="font-mono font-semibold">{c.code}</div>
                <div className="text-sm text-white/60">
                  {c.percentOff}% · استفاده: {c.usedCount}
                  {c.maxUses > 0 ? ` / ${c.maxUses}` : " / نامحدود"}
                  {c.expiresAt ? ` · انقضا: ${new Date(c.expiresAt).toLocaleDateString("sv-SE")}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggle(c)}
                  className={`rounded-full px-3 py-1 text-sm ${c.active ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/60"}`}
                >
                  {c.active ? "فعال" : "غیرفعال"}
                </button>
                {confirmId === c._id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => remove(c._id)}
                      className="rounded-full bg-red-500/20 px-3 py-1 text-sm text-red-300"
                    >
                      تأیید حذف
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      className="rounded-full bg-white/10 px-3 py-1 text-sm"
                    >
                      انصراف
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmId(c._id)}
                    className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/70 hover:text-red-300"
                  >
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