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

export interface FinancialStats {
  total: number;
  change: number;
  trend: "up" | "down" | "neutral";
}

interface Categories {
  [key: string]: number;
}

interface CategoriesData {
  categories: Categories;
  percentages: Categories;
}

interface Anomaly {
  date: string;
  description: string;
  amount: number;
  reason: string;
}

interface DailySummary {
  [key: string]: number;
}

interface CommulativeBalance {
  [key: string]: number;
}

interface SpendingAnalysis {
  total_spent: number;
  total_income: number;
  savings_rate: number;
  daily_summary: DailySummary;
  cumulative_balance: CommulativeBalance;
}

interface SpendingTrends {
  trend: "increasing" | "decreasing" | "stable";
  trend_slope: number;
  estimated_monthly_spend: number;
}

export interface SpendingReport {
  categories: CategoriesData;
  anomalies: Anomaly[];
  spending_analysis: SpendingAnalysis;
  spending_trends: SpendingTrends;
}
