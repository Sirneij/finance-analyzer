import { baseConfig } from "$config/base.config.ts";
import { Transaction } from "$models/transaction.model.ts";
import {
  FileUploadResult,
  ITransaction,
  SpendingReport,
  FinancialSummary,
  PaginatedTransactions,
} from "$types/transaction.types.ts";
import mongoose from "mongoose";
import { ParserFactory } from "$utils/parsers/factory.parsers.ts";
import { WebSocket } from "ws";

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
    page: number = 1,
    limit: number = 9
  ): Promise<PaginatedTransactions> {
    try {
      // If limit is -1, fetch all transactions
      const shouldFetchAll = limit === -1;
      const skip = shouldFetchAll ? 0 : (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        shouldFetchAll
          ? Transaction.find({ userId }).sort({ date: -1 })
          : Transaction.find({ userId })
              .sort({ date: -1 })
              .skip(skip)
              .limit(limit),
        Transaction.countDocuments({ userId }),
      ]);

      return {
        transactions,
        total,
        page: shouldFetchAll ? 1 : page,
        limit: shouldFetchAll ? total : limit,
      };
    } catch (error) {
      throw new Error("Failed to fetch transactions");
    }
  }

  static async summarizeTransactionsbyUserId(
    userId: mongoose.Types.ObjectId
  ): Promise<FinancialSummary> {
    try {
      const results = await this.findTransactionsByUserId(userId, 1, -1);
      const response = await fetch(
        `${baseConfig.utility_service_url}/summarize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(results.transactions),
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

  static async deleteTransactionsByUserId(
    userId: mongoose.Types.ObjectId,
    transactionIds: mongoose.Types.ObjectId[]
  ): Promise<void> {
    try {
      await Transaction.deleteMany({ userId, _id: { $in: transactionIds } });
    } catch (error) {
      throw new Error("Failed to delete transactions");
    }
  }

  static async analyzeTransactionsByUserIdWs(
    userId: mongoose.Types.ObjectId
  ): Promise<SpendingReport> {
    return this.handleWebSocketRequest(userId, "analyze");
  }

  static async summarizeTransactionsbyUserIdWs(
    userId: mongoose.Types.ObjectId
  ): Promise<FinancialSummary> {
    return this.handleWebSocketRequest(userId, "summary");
  }

  static async handleProgressAction(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const wsUrl = baseConfig.utility_service_url.replace(/^http/, "ws");
      baseConfig.logger.info(`Connecting to WebSocket server at ${wsUrl}`);
      const ws = new WebSocket(`${wsUrl}/ws`);

      ws.on("open", () => {
        ws.send(
          JSON.stringify({
            action: data.action,
          })
        );
      });

      ws.on("message", (message: string) => {
        const data = JSON.parse(message);

        baseConfig.logger.info(`WebSocket message received: ${message}`);

        resolve(data);
      });
      ws.on("error", (err) => {
        baseConfig.logger.error(`WebSocket error: ${err.message}`);
        reject(new Error(`WebSocket error: ${err.message}`));
      });
      ws.on("close", () => {
        baseConfig.logger.info("WebSocket connection closed");
      });
    });
  }

  private static async handleWebSocketRequest(
    userId: mongoose.Types.ObjectId,
    action: string
  ): Promise<any> {
    const transactions = await this.findTransactionsByUserId(userId, 1, -1);

    return new Promise((resolve, reject) => {
      const wsUrl = baseConfig.utility_service_url.replace(/^http/, "ws");
      baseConfig.logger.info(`Connecting to WebSocket server at ${wsUrl}`);
      const ws = new WebSocket(`${wsUrl}/ws`);

      ws.on("open", () => {
        ws.send(
          JSON.stringify({
            action,
            userId,
            transactions: transactions.transactions,
          })
        );
      });

      ws.on("message", (message: string) => {
        try {
          const data = JSON.parse(message);

          if (data.action === action) {
            resolve(data.result);
            ws.close();
          } else if (data.error) {
            reject(new Error(data.error));
            ws.close();
          }
        } catch (err) {
          reject(new Error("Failed to parse WebSocket response"));
          ws.close();
        }
      });

      ws.on("error", (err) => {
        reject(new Error(`WebSocket error: ${err.message}`));
      });

      ws.on("close", () => {
        console.info("WebSocket connection closed");
      });
    });
  }
}
