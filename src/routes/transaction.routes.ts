import { TransactionController } from "$controllers/transaction.controller.js";
import { isAuthenticated } from "$middlewares/auth.middleware.js";
import { Router } from "express";

const transactionRoutes = Router();
const transactionController = new TransactionController();

transactionRoutes.get(
  "/",
  isAuthenticated,
  transactionController.handleGetTransactions
);

transactionRoutes.post(
  "/",
  isAuthenticated,
  transactionController.handleCreateTransactions
);

transactionRoutes.delete(
  "/",
  isAuthenticated,
  transactionController.handleDeleteTransactions
);

transactionRoutes.post(
  "/upload",
  isAuthenticated,
  transactionController.handleFileUpload
);

transactionRoutes.get(
  "/summary",
  isAuthenticated,
  transactionController.handleGetIncomeExpensesSavings
);

transactionRoutes.get(
  "/analyze",
  isAuthenticated,
  transactionController.handleAnalyzeTransactions
);

export default transactionRoutes;
