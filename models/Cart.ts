import mongoose, { Schema, Model, InferSchemaType } from "mongoose";

const cartSchema = new Schema(
  {
    clerkUserId: { type: String, required: true, unique: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

export type ICart = InferSchemaType<typeof cartSchema>;

export const Cart: Model<ICart> =
  (mongoose.models.Cart as Model<ICart>) || mongoose.model<ICart>("Cart", cartSchema);
