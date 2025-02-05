import { baseConfig } from "$config/base.config.js";
import { Transaction } from "$models/transaction.model.js";
import type {
  FileUploadResult,
  ITransaction,
  SpendingReport,
  FinancialSummary,
  PaginatedTransactions,
} from "$types/transaction.types.js";
import mongoose from "mongoose";
import { ParserFactory } from "$utils/parsers/factory.parsers.js";
import { WebSocket } from "ws";
import { sendError } from "$utils/error.utils.js";

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
    const data = await parser.parse(buffer);

    await Transaction.insertMany(data);

    return {
      mimeType,
      data: data,
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

      // Add debug logging
      baseConfig.logger.info(
        `Searching for transactions with userId: ${userId}`
      );

      const [result] = await Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $facet: {
            transactions: [
              { $sort: { date: -1 } },
              { $skip: skip },
              ...(!shouldFetchAll ? [{ $limit: limit }] : []),
            ],
            total: [{ $count: "count" }],
          },
        },
      ]);

      // Add more debug logging
      baseConfig.logger.info(`Raw result: ${JSON.stringify(result)}`);

      const transactions = result.transactions;
      const total = result.total[0]?.count || 0;

      baseConfig.logger.info(`Fetched ${transactions.length} transactions`);

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
        `${baseConfig.utilityServiceUrl}/summarize`,
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

      return response.json() as Promise<FinancialSummary>;
    } catch (error) {
      throw new Error("Failed to fetch income/expenses/savings");
    }
  }

  static async analyzeTransactionsByUserId(
    userId: mongoose.Types.ObjectId
  ): Promise<SpendingReport> {
    try {
      const transactions = await this.findTransactionsByUserId(userId, 1, -1);
      const response = await fetch(`${baseConfig.utilityServiceUrl}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactions),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze transactions");
      }

      return response.json() as Promise<SpendingReport>;
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

  static async connectToUtilityServer(
    action: string,
    transactions: ITransaction[],
    frontendWs: WebSocket
  ) {
    const wsUrl = baseConfig.utilityServiceUrl.replace(/^http/, "ws");
    const ws = new WebSocket(`${wsUrl}/ws`);

    ws.on("open", () => {
      baseConfig.logger.info(
        `Connected to utility server for '${action}' at ${wsUrl}`
      );
      ws.send(JSON.stringify({ action, transactions }));
    });

    ws.on("message", (message: string) => {
      const data = JSON.parse(message);
      frontendWs.send(JSON.stringify(data));
    });

    ws.on("close", () => {
      frontendWs.send(
        JSON.stringify({
          action: "progress",
          message: `Connection to utility server closed for ${action}.`,
          type: action,
        })
      );
    });

    ws.on("error", (err) => {
      sendError(
        frontendWs,
        `Utility server WebSocket error: ${err.message}`,
        action
      );
    });
  }
}
