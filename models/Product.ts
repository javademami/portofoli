import mongoose, { Schema, Model, InferSchemaType } from "mongoose";

const productSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    priceUsdt: { type: Number, default: 0, min: 0 },
    priceSek: { type: Number, default: 0, min: 0 },
    coverImage: { type: String, default: "" },
    fileKey: { type: String, default: "", select: false },
    fileName: { type: String, default: "" },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type IProduct = InferSchemaType<typeof productSchema>;

export const Product: Model<IProduct> =
  (mongoose.models.Product as Model<IProduct>) || mongoose.model<IProduct>("Product", productSchema);
