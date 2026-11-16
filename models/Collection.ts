import mongoose, { Schema, InferSchemaType } from "mongoose";

const CollectionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, default: "", maxlength: 2000 },
    coverImage: { type: String, default: "" },
    parent: { type: Schema.Types.ObjectId, ref: "Collection", default: null },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type CollectionType = InferSchemaType<typeof CollectionSchema>;

export const Collection =
  (mongoose.models.Collection as mongoose.Model<CollectionType>) ||
  mongoose.model<CollectionType>("Collection", CollectionSchema);