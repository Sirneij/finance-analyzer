import { TransactionService } from "$services/transaction.service.ts";
import { RouteDoc } from "$utils/docs.utils.ts";
import busboy from "busboy";
import { Request, Response } from "express";

export class TransactionController {
  @RouteDoc({
    description: "Upload a file containing transactions",
    responses: {
      "200": { description: "Success" },
      "400": { description: "Failed to upload file" },
      "401": { description: "User ID not found" },
    },
  })
  static async handleFileUpload(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User ID not found",
        });
        return;
      }

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
            } catch (error) {
              reject(error);
            }
          });
        });

        bb.on("error", (err) => reject(err));

        req.pipe(bb);
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  }

  static async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User ID not found",
        });
        return;
      }

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

  static async getIncomeExpensesSavings(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User ID not found",
        });
        return;
      }

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

  static async analyzeTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User ID not found",
        });
        return;
      }

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

  static async createTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User ID not found",
        });
        return;
      }

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

  static async deleteTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User ID not found",
        });
        return;
      }

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
