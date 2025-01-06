import { baseConfig } from "$config/base.config.ts";
import { Transaction } from "$models/transaction.model.ts";
import {
  FileUploadResult,
  FinancialStats,
  ITransaction,
  SpendingReport,
} from "$types/transaction.types.ts";
import mongoose from "mongoose";
import { ParserFactory } from "$utils/parsers/factory.parsers.ts";

export class TransactionService {
  static async processFile(
    buffer: Buffer,
    mimeType: string,
    userId: mongoose.Types.ObjectId
  ): Promise<FileUploadResult> {
    if (!ParserFactory.isSupportedType(mimeType)) {
      throw new Error("Unsupported file type");
    }

    const parser = ParserFactory.getParser(mimeType, userId);
    const transactions = await parser.parse(buffer);

    baseConfig.logger.info(`Parsed ${transactions.length} transactions`);

    await Transaction.insertMany(transactions);

    return {
      transactions,
      mimeType,
    };
  }

  static async findTransactionsByUserId(
    userId: mongoose.Types.ObjectId,
    limit?: number
  ): Promise<ITransaction[]> {
    try {
      const query = Transaction.find({ userId }).sort({ date: -1 });
      if (limit) {
        query.limit(limit);
      }
      const transactions = await query;
      return transactions;
    } catch (error) {
      throw new Error("Failed to fetch transactions");
    }
  }

  static async findIncomeExpensesSavingsByUserId(
    userId: mongoose.Types.ObjectId
  ): Promise<{
    income: FinancialStats;
    expenses: FinancialStats;
    savings: FinancialStats;
  }> {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const currentYear = currentDate.getFullYear();
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      // Current month transactions
      const currentTransactions = await Transaction.find({
        userId,
        createdAt: {
          $gte: new Date(currentYear, currentMonth, 1),
          $lt: new Date(currentYear, currentMonth + 1, 1),
        },
      });

      // Previous month transactions
      const previousTransactions = await Transaction.find({
        userId,
        createdAt: {
          $gte: new Date(previousYear, previousMonth, 1),
          $lt: new Date(previousYear, previousMonth + 1, 1),
        },
      });

      const calculateStats = (
        current: number,
        previous: number
      ): FinancialStats => {
        const change =
          previous === 0 ? 0 : ((current - previous) / previous) * 100;
        return {
          total: current,
          change: Number(change.toFixed(1)),
          trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
        };
      };

      const getCurrentTotal = (type: string) =>
        currentTransactions
          .filter((t) => t.type === type)
          .reduce((acc, t) => acc + Math.abs(t.amount), 0);

      const getPreviousTotal = (type: string) =>
        previousTransactions
          .filter((t) => t.type === type)
          .reduce((acc, t) => acc + Math.abs(t.amount), 0);

      const currentIncome = getCurrentTotal("income");
      const previousIncome = getPreviousTotal("income");
      const currentExpenses = getCurrentTotal("expense");
      const previousExpenses = getPreviousTotal("expense");
      const currentSavings = currentIncome - currentExpenses;
      const previousSavings = previousIncome - previousExpenses;

      return {
        income: calculateStats(currentIncome, previousIncome),
        expenses: calculateStats(currentExpenses, previousExpenses),
        savings: calculateStats(currentSavings, previousSavings),
      };
    } catch (error) {
      throw new Error("Failed to fetch income/expenses/savings");
    }
  }

  static async analyzeTransactionsByUserId(
    userId: mongoose.Types.ObjectId
  ): Promise<SpendingReport> {
    try {
      const transactions = await Transaction.find({ userId });
      const response = await fetch(
        `${baseConfig.utility_service_url}/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transactions),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to analyze transactions");
      }

      return response.json();
    } catch (error) {
      throw new Error("Failed to analyze transactions");
    }
  }

  static async createTransactionsByUserId(
    userId: mongoose.Types.ObjectId,
    transactions: ITransaction[]
  ): Promise<void> {
    try {
      await Transaction.insertMany(transactions.map((t) => ({ ...t, userId })));
    } catch (error) {
      throw new Error("Failed to create transactions");
    }
  }
}
