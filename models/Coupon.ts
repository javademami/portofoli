import mongoose, { Schema, InferSchemaType } from "mongoose";

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    percentOff: { type: Number, required: true, min: 1, max: 100 },
    maxUses: { type: Number, default: 0, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type CouponType = InferSchemaType<typeof CouponSchema>;

export const Coupon =
  (mongoose.models.Coupon as mongoose.Model<CouponType>) ||
  mongoose.model<CouponType>("Coupon", CouponSchema);