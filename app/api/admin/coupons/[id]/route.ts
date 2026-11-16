import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/mongodb";
import { Coupon } from "@/models/Coupon";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  if (typeof body.active !== "boolean") {
    return NextResponse.json({ error: "active must be boolean" }, { status: 400 });
  }

  await connectDB();
  const updated = await Coupon.findByIdAndUpdate(id, { active: body.active }, { new: true }).lean();
  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  await connectDB();
  await Coupon.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}