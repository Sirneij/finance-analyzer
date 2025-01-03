import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  date: Date;
  amount: number;
  balance: number;
  category: string;
  description: string;
  type: "income" | "expense";
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);
