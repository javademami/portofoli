import mongoose, { Schema, Model, InferSchemaType } from "mongoose";

const productSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    priceSek: { type: Number, required: true, min: 0 },
    coverImage: { type: String },
    fileKey: { type: String, required: true, select: false },
    fileName: { type: String, required: true },
    published: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export type IProduct = InferSchemaType<typeof productSchema>;

export const Product: Model<IProduct> =
  (mongoose.models.Product as Model<IProduct>) ||
  mongoose.model<IProduct>("Product", productSchema);