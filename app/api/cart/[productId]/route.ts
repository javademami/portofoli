import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Cart } from "@/models/Cart";

type Ctx = { params: Promise<{ productId: string }> };

// Removes one product from the cart.
export async function DELETE(_req: Request, { params }: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { productId } = await params;
  if (!Types.ObjectId.isValid(productId)) {
    return NextResponse.json({ error: "invalid product" }, { status: 400 });
  }

  await connectDB();
  await Cart.updateOne(
    { clerkUserId: userId },
    { $pull: { products: new Types.ObjectId(productId) } }
  );

  return NextResponse.json({ ok: true });
}
