import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Purchase } from "@/models/Purchase";

type PaidCryptoOrder = {
  _id: unknown;
  userId: string;
  productId: unknown;
  txid?: string | null;
};

// Creates the purchase for a paid crypto order. Safe to call twice: the reference is unique.
export async function fulfillCryptoOrder(order: PaidCryptoOrder) {
  await connectDB();

  const product = await Product.findById(order.productId).select("priceSek").lean();
  if (!product) throw new Error("product missing for crypto order " + String(order._id));

  // Orders confirmed by hand without a txid use the order id as their reference.
  const ref = order.txid ? `crypto:${order.txid}` : `crypto-manual:${String(order._id)}`;

  await Purchase.updateOne(
    { stripeSessionId: ref },
    {
      $setOnInsert: {
        clerkUserId: order.userId,
        product: order.productId,
        amountSek: product.priceSek,
        status: "paid",
      },
    },
    { upsert: true }
  );
}
