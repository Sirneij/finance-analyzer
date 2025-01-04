import { TransactionController } from "$controllers/transaction.controller.ts";
import { isAuthenticated } from "$middlewares/auth.middleware.ts";
import { Router } from "express";

const transactionRouters = Router();

transactionRouters.post(
  "/upload",
  isAuthenticated,
  TransactionController.handleFileUpload
);

transactionRouters.get(
  "/",
  isAuthenticated,
  TransactionController.getTransactions
);

transactionRouters.get(
  "/summary",
  isAuthenticated,
  TransactionController.getIncomeExpensesSavings
);

export default transactionRouters;
