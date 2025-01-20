import mongoose, { Document } from "mongoose";
import { Resume } from "$types/resume.types.js";

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

export interface PaginatedTransactions {
  transactions: ITransaction[];
  total: number;
  page: number;
  limit: number;
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
  data: Partial<ITransaction>[] | Resume;
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

interface SpendingAnalysis {
  total_spent: number;
  total_income: number;
  savings_rate: number;
  daily_summary: Categories;
  cumulative_balance: Categories;
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

export interface FinancialSummary {
  income: FinancialStats;
  expenses: FinancialStats;
  savings: FinancialStats;
  total_transactions: number;
  expense_count: number;
  income_count: number;
  avg_expense: number;
  avg_income: number;
  start_date: string;
  end_date: string;
  largest_expense: number;
  largest_income: number;
  savings_rate: number;
  monthly_summary: Record<string, any>;
}
