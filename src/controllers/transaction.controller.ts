import { TransactionService } from "$services/transaction.service.js";
import { processFileUpload } from "$utils/upload.utils.js";
import type { Request, Response } from "express";
import mongoose from "mongoose";

export class TransactionController {
  async handleFileUpload(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id as mongoose.Types.ObjectId;
      const result = await processFileUpload(req, async (buffer, info) => {
        if (
          info.mimeType !== "text/csv" &&
          info.mimeType !== "application/pdf"
        ) {
          throw new Error("Only CSV and PDF files are allowed");
        }
        return await TransactionService.processFile(
          buffer,
          info.mimeType,
          userId
        );
      });
      res.json({ success: true, ...result });
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
        transactions: result.transactions,
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
