import { TransactionController } from "$controllers/transaction.controller.ts";
import { isAuthenticated } from "$middlewares/auth.middleware.ts";
import { Router } from "express";

const transactionRouters = Router();

transactionRouters.get(
  "/",
  isAuthenticated,
  TransactionController.getTransactions
);

transactionRouters.post(
  "/",
  isAuthenticated,
  TransactionController.createTransactions
);

transactionRouters.delete(
  "/",
  isAuthenticated,
  TransactionController.deleteTransactions
);

transactionRouters.post(
  "/upload",
  isAuthenticated,
  TransactionController.handleFileUpload
);

transactionRouters.get(
  "/summary",
  isAuthenticated,
  TransactionController.getIncomeExpensesSavings
);

transactionRouters.get(
  "/analyze",
  isAuthenticated,
  TransactionController.analyzeTransactions
);

export default transactionRouters;
