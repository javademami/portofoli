import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Ticket } from "@/models/Ticket";

type Ctx = { params: Promise<{ id: string }> };

// One of the current user's tickets, with all messages.
export async function GET(_req: Request, { params }: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  await connectDB();
  const ticket = await Ticket.findOne({ _id: id, clerkUserId: userId }).lean();
  if (!ticket) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({ ticket });
}

// The user replies to their own ticket. Closed tickets cannot be answered.
export async function POST(req: Request, { params }: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length > 5000) {
    return NextResponse.json({ error: "invalid message" }, { status: 400 });
  }

  await connectDB();
  const updated = await Ticket.findOneAndUpdate(
    { _id: id, clerkUserId: userId, status: { $ne: "closed" } },
    {
      $push: { messages: { author: "user", body: message } },
      $set: { status: "open", lastMessageAt: new Date() },
    },
    { new: true }
  );
  if (!updated) {
    return NextResponse.json({ error: "ticket closed or not found" }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
