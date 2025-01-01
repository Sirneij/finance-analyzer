import mongoose, { Schema } from "mongoose";
import { AuthUser } from "$types/auth.types.ts";

const userSchema = new Schema<AuthUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
    avatar: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<AuthUser>("User", userSchema);
