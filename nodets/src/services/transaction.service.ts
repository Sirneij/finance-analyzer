import { baseConfig } from "$config/base.config.ts";
import { Transaction } from "$models/transaction.model.ts";
import {
  FileUploadResult,
  ITransaction,
  SpendingReport,
  FinancialSummary,
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

  static async summarizeTransactionsbyUserId(
    userId: mongoose.Types.ObjectId
  ): Promise<FinancialSummary> {
    try {
      const transactions = await this.findTransactionsByUserId(userId);
      const response = await fetch(
        `${baseConfig.utility_service_url}/summarize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transactions),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to summarize transactions");
      }

      return response.json();
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
