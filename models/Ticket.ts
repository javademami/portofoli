import mongoose, { Schema, Model, InferSchemaType } from "mongoose";

const messageSchema = new Schema(
  {
    author: { type: String, enum: ["user", "admin"], required: true },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ticketSchema = new Schema(
  {
    clerkUserId: { type: String, required: true, index: true },
    userEmail: { type: String, default: "" },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    status: { type: String, enum: ["open", "answered", "closed"], default: "open", index: true },
    messages: { type: [messageSchema], default: [] },
    lastMessageAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export type ITicket = InferSchemaType<typeof ticketSchema>;

export const Ticket: Model<ITicket> =
  (mongoose.models.Ticket as Model<ITicket>) || mongoose.model<ITicket>("Ticket", ticketSchema);
