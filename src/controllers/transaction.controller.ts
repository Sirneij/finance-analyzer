import { baseConfig } from "$config/base.config.js";
import { TransactionService } from "$services/transaction.service.js";
import { RouteDoc } from "$utils/docs.utils.js";
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
              baseConfig.logger.info(`Result: ${JSON.stringify(result)}`);
              if (!isFileProcessed) {
                isFileProcessed = true;
                res.json({ success: true, ...result });
                resolve();
              }
            } catch (err) {
              baseConfig.logger.error(`Catch: ${err}`);
              reject(err);
            }
          });
        });

        bb.on("error", (err) => {
          baseConfig.logger.error(`OnError: ${err}`);
          reject(err);
        });

        req.pipe(bb);
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Upload failed",
      });
    }
  }

  async handleGetTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id as mongoose.Types.ObjectId;

      let page = Number(req.query.page);
      let limit = Number(req.query.limit);

      if (isNaN(page)) {
        page = 1;
      }

      if (isNaN(limit)) {
        limit = 10;
      }

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
        success: true,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch transactions",
      });
    }
  }

  async handleGetIncomeExpensesSavings(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?._id as mongoose.Types.ObjectId;

      const summary = await TransactionService.summarizeTransactionsbyUserId(
        userId
      );

      res.status(200).json({ summary, success: true });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch income/expenses/savings",
      });
    }
  }

  async handleAnalyzeTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id as mongoose.Types.ObjectId;

      const data = await TransactionService.analyzeTransactionsByUserId(userId);

      res.status(200).json({ data, success: true });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to analyze transactions",
      });
    }
  }

  async handleCreateTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id as mongoose.Types.ObjectId;

      const transactions = req.body;

      await TransactionService.createTransactionsByUserId(userId, transactions);

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create transactions",
      });
    }
  }

  async handleDeleteTransactions(req: Request, res: Response): Promise<void> {
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
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete transactions",
      });
    }
  }
}
