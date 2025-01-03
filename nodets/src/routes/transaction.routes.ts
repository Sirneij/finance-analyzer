import { UploadController } from "$controllers/transaction.controller.ts";
import { isAuthenticated } from "$middlewares/auth.middleware.ts";
import { Router } from "express";

const transactionRouters = Router();

transactionRouters.post(
  "/upload",
  isAuthenticated,
  UploadController.handleFileUpload
);

export default transactionRouters;
