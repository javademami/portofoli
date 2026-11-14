import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function isAdmin(): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  if (!adminEmail) return false;
  const user = await currentUser();
  if (!user) return false;
  return user.emailAddresses.some(
    (e) =>
      e.emailAddress.toLowerCase() === adminEmail &&
      e.verification?.status === "verified"
  );
}

/** Returns a 403 response when the caller is not the admin, otherwise null. */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdmin()) return null;
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}