import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IPurchase extends Document {
  clerkUserId: string;
  product: mongoose.Types.ObjectId;
  stripeSessionId: string;
  amountSek: number;
  status: "pending" | "paid" | "refunded";
  createdAt?: Date;
  updatedAt?: Date;
}

const purchaseSchema = new Schema<IPurchase>(
  {
    clerkUserId: { type: String, required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    stripeSessionId: { type: String, required: true, unique: true },
    amountSek: { type: Number, required: true },
    status: { type: String, enum: ["pending", "paid", "refunded"], default: "pending" },
  },
  { timestamps: true }
);

purchaseSchema.index({ clerkUserId: 1, product: 1 });

export const Purchase =
  (mongoose.models.Purchase as Model<IPurchase> | undefined) ??
  mongoose.model<IPurchase>("Purchase", purchaseSchema);