import mongoose, { Schema, Model, InferSchemaType } from "mongoose";

// One order can contain several products. Each product becomes its own Purchase after payment.
const cryptoOrderSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product", required: true }],
    amountMicro: { type: Number, required: true },
    network: { type: String, default: "TRC20" },
    address: { type: String, required: true },
    status: { type: String, enum: ["pending", "paid", "expired"], default: "pending", index: true },
    txid: { type: String, unique: true, sparse: true },
    expiresAt: { type: Date, required: true },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export type ICryptoOrder = InferSchemaType<typeof cryptoOrderSchema>;

export const CryptoOrder: Model<ICryptoOrder> =
  (mongoose.models.CryptoOrder as Model<ICryptoOrder>) ||
  mongoose.model<ICryptoOrder>("CryptoOrder", cryptoOrderSchema);
