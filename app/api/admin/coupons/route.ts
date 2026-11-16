import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/mongodb";
import { Coupon } from "@/models/Coupon";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  await connectDB();
  const coupons = await Coupon.find({})
    .sort({ createdAt: -1 })
    .limit(300)
    .lean();
  return NextResponse.json({ coupons });
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));

  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) {
    return NextResponse.json({ error: "invalid code" }, { status: 400 });
  }

  const percentOff = Number(body.percentOff);
  if (!Number.isInteger(percentOff) || percentOff < 1 || percentOff > 100) {
    return NextResponse.json({ error: "percentOff must be 1-100" }, { status: 400 });
  }

  const maxUses = Number(body.maxUses ?? 0);
  if (!Number.isInteger(maxUses) || maxUses < 0) {
    return NextResponse.json({ error: "invalid maxUses" }, { status: 400 });
  }

  let expiresAt: Date | null = null;
  if (body.expiresAt) {
    const d = new Date(body.expiresAt);
    if (isNaN(d.getTime())) {
      return NextResponse.json({ error: "invalid expiresAt" }, { status: 400 });
    }
    expiresAt = d;
  }

  await connectDB();
  try {
    const coupon = await Coupon.create({ code, percentOff, maxUses, expiresAt, active: true });
    return NextResponse.json({ id: String(coupon._id) }, { status: 201 });
  } catch (e) {
    if ((e as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "code already exists" }, { status: 409 });
    }
    throw e;
  }
}