import { TransactionController } from "$controllers/transaction.controller.ts";
import { isAuthenticated } from "$middlewares/auth.middleware.ts";
import { Router } from "express";

const transactionRouters = Router();
const transactionController = new TransactionController();

transactionRouters.get(
  "/",
  isAuthenticated,
  transactionController.getTransactions
);

transactionRouters.post(
  "/",
  isAuthenticated,
  transactionController.createTransactions
);

transactionRouters.delete(
  "/",
  isAuthenticated,
  transactionController.deleteTransactions
);

transactionRouters.post(
  "/upload",
  isAuthenticated,
  transactionController.handleFileUpload
);

transactionRouters.get(
  "/summary",
  isAuthenticated,
  transactionController.getIncomeExpensesSavings
);

transactionRouters.get(
  "/analyze",
  isAuthenticated,
  transactionController.analyzeTransactions
);

export default transactionRouters;
