import { TransactionService } from "$services/transaction.service.ts";
import { RouteDoc } from "$utils/docs.utils.ts";
import busboy from "busboy";
import { Request, Response } from "express";
import mongoose from "mongoose";

export class TransactionController {
  @RouteDoc({
    description: "Upload a file containing transactions",
    responses: {
      "200": { description: "Success" },
      "400": { description: "Failed to upload file" },
      "401": { description: "User ID not found" },
    },
  })
  async handleFileUpload(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id as mongoose.Types.ObjectId;

      await new Promise<void>((resolve, reject) => {
        const bb = busboy({ headers: req.headers });
        let isFileProcessed = false;

        bb.on("file", (name, file, info) => {
          const chunks: Buffer[] = [];

          file.on("data", (chunk) => chunks.push(chunk));

          file.on("end", async () => {
            try {
              const buffer = Buffer.concat(chunks);
              const result = await TransactionService.processFile(
                buffer,
                info.mimeType,
                userId
              );
              if (!isFileProcessed) {
                isFileProcessed = true;
                res.json({ success: true, ...result });
                resolve();
              }
            } catch (err) {
              reject(err);
            }
          });
        });

        bb.on("error", (err) => {
          reject(err);
        });

        req.pipe(bb);
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  }

  async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id as mongoose.Types.ObjectId;

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 9;

      const result = await TransactionService.findTransactionsByUserId(
        userId,
        page,
        limit
      );

      res.json({
        data: result.transactions,
        metadata: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch transactions",
      });
    }
  }

  async getIncomeExpensesSavings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id as mongoose.Types.ObjectId;

      const summary = await TransactionService.summarizeTransactionsbyUserId(
        userId
      );

      res.json(summary);
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch income/expenses/savings",
      });
    }
  }

  async analyzeTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id as mongoose.Types.ObjectId;

      const data = await TransactionService.analyzeTransactionsByUserId(userId);

      res.json(data);
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze transactions",
      });
    }
  }

  async createTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id as mongoose.Types.ObjectId;

      const transactions = req.body;

      await TransactionService.createTransactionsByUserId(userId, transactions);

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create transactions",
      });
    }
  }

  async deleteTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id as mongoose.Types.ObjectId;

      const transactionIds = req.body;

      await TransactionService.deleteTransactionsByUserId(
        userId,
        transactionIds
      );

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete transactions",
      });
    }
  }
}
