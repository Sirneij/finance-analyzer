import mongoose, { Document } from "mongoose";

export interface ITransaction extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  date: Date;
  amount: number;
  balance: number;
  description: string;
  type: "income" | "expense";
  createdAt: Date;
  updatedAt: Date;
}

export interface RawTransaction {
  userId: mongoose.Types.ObjectId;
  date: string | Date;
  amount: number;
  balance: number;
  description: string;
  type: string;
}

export interface UploadResponse {
  success: boolean;
  transactions?: Partial<ITransaction>[];
  error?: string;
}

export interface FileUploadResult {
  transactions: Partial<ITransaction>[];
  mimeType: string;
}
