import mongoose, { Schema, InferSchemaType } from "mongoose";

const ReviewSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    clerkUserId: { type: String, required: true },
    authorName: { type: String, default: "", maxlength: 80 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    body: { type: String, default: "", maxlength: 2000 },
    approved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, clerkUserId: 1 }, { unique: true });

export type ReviewType = InferSchemaType<typeof ReviewSchema>;

export const Review =
  (mongoose.models.Review as mongoose.Model<ReviewType>) ||
  mongoose.model<ReviewType>("Review", ReviewSchema);