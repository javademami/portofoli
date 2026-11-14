import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/mongodb";
import { CryptoOrder } from "@/models/CryptoOrder";
import { fulfillCryptoOrder } from "@/lib/fulfill";

type Ctx = { params: Promise<{ id: string }> };

// Admin marks an order as paid by hand (underpaid, overpaid, late, or verified manually).
export async function POST(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "شناسه نامعتبر است" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const txid = typeof body.txid === "string" && body.txid.trim() ? body.txid.trim() : null;

  await connectDB();
  try {
    const claimed = await CryptoOrder.findOneAndUpdate(
      { _id: id, status: { $ne: "paid" } },
      { status: "paid", paidAt: new Date(), ...(txid ? { txid } : {}) },
      { new: true }
    );
    if (!claimed) {
      return NextResponse.json({ error: "این سفارش قبلاً پرداخت شده یا وجود ندارد" }, { status: 409 });
    }

    await fulfillCryptoOrder(claimed);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.code === 11000) {
      return NextResponse.json({ error: "این txid قبلاً برای سفارش دیگری ثبت شده است" }, { status: 409 });
    }
    console.error("[manual confirm]", err);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
