import mongoose, { Schema, Model, InferSchemaType } from "mongoose";

const cryptoOrderSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    amountMicro: { type: Number, required: true }, // USDT in micro units (6 decimals)
    network: { type: String, default: "TRC20" },
    address: { type: String, required: true },
    status: { type: String, enum: ["pending", "paid", "expired"], default: "pending", index: true },
    txid: { type: String, unique: true, sparse: true },
    expiresAt: { type: Date, required: true, index: true },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export type ICryptoOrder = InferSchemaType<typeof cryptoOrderSchema>;

export const CryptoOrder: Model<ICryptoOrder> =
  (mongoose.models.CryptoOrder as Model<ICryptoOrder>) ||
  mongoose.model<ICryptoOrder>("CryptoOrder", cryptoOrderSchema);
