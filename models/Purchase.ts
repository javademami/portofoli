import mongoose, { Schema, Model, InferSchemaType } from "mongoose";

const purchaseSchema = new Schema(
  {
    clerkUserId: { type: String, required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    stripeSessionId: { type: String, required: true, unique: true },
    amountSek: { type: Number, default: 0 },
    amountUsdt: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "paid", "refunded"], default: "pending" },
  },
  { timestamps: true }
);

export type IPurchase = InferSchemaType<typeof purchaseSchema>;

export const Purchase: Model<IPurchase> =
  (mongoose.models.Purchase as Model<IPurchase>) || mongoose.model<IPurchase>("Purchase", purchaseSchema);
