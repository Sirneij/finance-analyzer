import { ITransaction } from "$types/transaction.types.js";
import mongoose, { Schema } from "mongoose";

const transactionSchema = new Schema(
  {
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
