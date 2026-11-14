import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/mongodb";
import { Ticket } from "@/models/Ticket";

const STATUSES = ["open", "answered", "closed"];

// All tickets, optionally filtered with ?status=open|answered|closed.
export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const status = new URL(req.url).searchParams.get("status");
  const filter = status && STATUSES.includes(status) ? { status } : {};

  await connectDB();
  const tickets = await Ticket.find(filter)
    .select("clerkUserId userEmail subject status lastMessageAt createdAt")
    .sort({ lastMessageAt: -1 })
    .limit(200)
    .lean();

  return NextResponse.json({ tickets });
}
