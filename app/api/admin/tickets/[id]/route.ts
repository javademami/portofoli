import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/mongodb";
import { Ticket } from "@/models/Ticket";

type Ctx = { params: Promise<{ id: string }> };

const STATUSES = ["open", "answered", "closed"];

export async function GET(_req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  await connectDB();
  const ticket = await Ticket.findById(id).lean();
  if (!ticket) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({ ticket });
}

// Admin reply. Marks the ticket as answered, waiting for the user.
export async function POST(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length > 5000) {
    return NextResponse.json({ error: "invalid message" }, { status: 400 });
  }

  await connectDB();
  const updated = await Ticket.findByIdAndUpdate(
    id,
    {
      $push: { messages: { author: "admin", body: message } },
      $set: { status: "answered", lastMessageAt: new Date() },
    },
    { new: true }
  );
  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}

// Change status: open, answered or closed.
export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  if (!STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  await connectDB();
  const updated = await Ticket.findByIdAndUpdate(id, { status: body.status });
  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
