import mongoose, { Schema, Model, InferSchemaType } from "mongoose";

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 120 },
    excerpt: { type: String, default: "", trim: true, maxlength: 500 },
    content: { type: String, default: "", maxlength: 50000 },
    coverImage: { type: String, default: "" },
    published: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type IPost = InferSchemaType<typeof postSchema>;

export const Post: Model<IPost> =
  (mongoose.models.Post as Model<IPost>) || mongoose.model<IPost>("Post", postSchema);
