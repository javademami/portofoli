import mongoose, { Schema, InferSchemaType } from "mongoose";

const FaqSchema = new Schema(
  {
    question: { type: String, required: true, trim: true, maxlength: 300 },
    answer: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: "", maxlength: 5000 },
    priceUsdt: { type: Number, default: 0, min: 0 },
    priceSek: { type: Number, default: 0, min: 0 },
    coverImage: { type: String, default: "" },
    gallery: { type: [String], default: [] },
    faq: { type: [FaqSchema], default: [] },
    demoUrl: { type: String, default: "", maxlength: 500 },
    collection: { type: Schema.Types.ObjectId, ref: "Collection", default: null },
    fileKey: { type: String, required: true, select: false },
    fileName: { type: String, default: "" },
    fileFormat: { type: String, default: "" },
    fileSize: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 83, min: 0 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type ProductType = InferSchemaType<typeof ProductSchema>;

export const Product =
  (mongoose.models.Product as mongoose.Model<ProductType>) ||
  mongoose.model<ProductType>("Product", ProductSchema);