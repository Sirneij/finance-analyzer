import { TransactionController } from "$controllers/transaction.controller.ts";
import { isAuthenticated } from "$middlewares/auth.middleware.ts";
import { Router } from "express";

const transactionRoutes = Router();
const transactionController = new TransactionController();

transactionRoutes.get(
  "/",
  isAuthenticated,
  transactionController.getTransactions
);

transactionRoutes.post(
  "/",
  isAuthenticated,
  transactionController.createTransactions
);

transactionRoutes.delete(
  "/",
  isAuthenticated,
  transactionController.deleteTransactions
);

transactionRoutes.post(
  "/upload",
  isAuthenticated,
  transactionController.handleFileUpload
);

transactionRoutes.get(
  "/summary",
  isAuthenticated,
  transactionController.getIncomeExpensesSavings
);

transactionRoutes.get(
  "/analyze",
  isAuthenticated,
  transactionController.analyzeTransactions
);

export default transactionRoutes;
