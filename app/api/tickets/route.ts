import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Ticket } from "@/models/Ticket";

// The current user's tickets, newest activity first.
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  await connectDB();
  const tickets = await Ticket.find({ clerkUserId: userId })
    .select("subject status lastMessageAt createdAt")
    .sort({ lastMessageAt: -1 })
    .lean();
  return NextResponse.json({ tickets });
}

// Creates a ticket with its first message.
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!subject || subject.length > 200) {
    return NextResponse.json({ error: "invalid subject" }, { status: 400 });
  }
  if (!message || message.length > 5000) {
    return NextResponse.json({ error: "invalid message" }, { status: 400 });
  }

  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? "";

  await connectDB();
  const ticket = await Ticket.create({
    clerkUserId: userId,
    userEmail,
    subject,
    status: "open",
    messages: [{ author: "user", body: message }],
    lastMessageAt: new Date(),
  });

  return NextResponse.json({ id: String(ticket._id) }, { status: 201 });
}
