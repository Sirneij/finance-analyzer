import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import { TransactionController } from "$controllers/transaction.controller";
import { TransactionService } from "$services/transaction.service.js";
import * as uploadUtils from "$utils/upload.utils.js";
import mongoose from "mongoose";

// Mock the upload utils
vi.mock("$utils/upload.utils.js", () => ({
  processFileUpload: vi.fn(),
}));

function createFreshReqRes() {
  const req: Partial<Request> = {
    params: {},
    query: {},
    body: {},
    user: {
      isJohnOwolabiIdogun: false,
      _id: new mongoose.Types.ObjectId(),
      email: "",
      provider: "",
      providerId: 2,
      avatar: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const res: Partial<Response> = {
    json: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
  };

  return { req: req as Request, res: res as Response };
}

describe("TransactionController", () => {
  let controller: TransactionController;
  let req: Request;
  let res: Response;
  const userId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    vi.resetAllMocks();
    controller = new TransactionController();
    const fresh = createFreshReqRes();
    ({ req, res } = fresh);
    if (req.user) {
      req.user._id = userId;
    }
  });

  describe("handleFileUpload", () => {
    it("should process CSV file upload successfully", async () => {
      const mockResult = { processed: 10, errors: [] };
      const mockBuffer = Buffer.from("test data");
      const mockFileInfo = { mimeType: "text/csv", filename: "test.csv" };

      vi.mocked(uploadUtils.processFileUpload).mockImplementation(
        async (_, handler) => {
          return handler(mockBuffer, mockFileInfo as any);
        }
      );

      vi.spyOn(TransactionService, "processFile").mockResolvedValue(
        mockResult as any
      );

      await controller.handleFileUpload(req, res);

      expect(TransactionService.processFile).toHaveBeenCalledWith(
        mockBuffer,
        "text/csv",
        userId
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...mockResult,
      });
    });

    it("should reject unsupported file types", async () => {
      const mockBuffer = Buffer.from("test data");
      const mockFileInfo = { mimeType: "image/jpeg", filename: "test.jpg" };

      vi.mocked(uploadUtils.processFileUpload).mockImplementation(
        async (_, handler) => {
          return handler(mockBuffer, mockFileInfo as any);
        }
      );

      await controller.handleFileUpload(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Only CSV and PDF files are allowed",
      });
    });

    it("should handle upload processing errors", async () => {
      const mockBuffer = Buffer.from("test data");
      const mockFileInfo = { mimeType: "text/csv", filename: "test.csv" };

      vi.mocked(uploadUtils.processFileUpload).mockImplementation(
        async (_, handler) => {
          return handler(mockBuffer, mockFileInfo as any);
        }
      );

      vi.spyOn(TransactionService, "processFile").mockRejectedValue(
        "Processing failed"
      );

      await controller.handleFileUpload(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Upload failed",
      });
    });
  });

  describe("handleGetTransactions", () => {
    const mockTransactions = {
      transactions: [
        { _id: new mongoose.Types.ObjectId(), amount: 100 },
        { _id: new mongoose.Types.ObjectId(), amount: -50 },
      ],
      total: 2,
      page: 1,
      limit: 10,
    };

    it("should return paginated transactions", async () => {
      vi.spyOn(
        TransactionService,
        "findTransactionsByUserId"
      ).mockResolvedValue(mockTransactions as any);

      await controller.handleGetTransactions(req, res);

      expect(TransactionService.findTransactionsByUserId).toHaveBeenCalledWith(
        userId,
        1,
        10
      );
      expect(res.json).toHaveBeenCalledWith({
        transactions: mockTransactions.transactions,
        metadata: {
          total: mockTransactions.total,
          page: mockTransactions.page,
          limit: mockTransactions.limit,
          totalPages: Math.ceil(
            mockTransactions.total / mockTransactions.limit
          ),
        },
        success: true,
      });
    });

    it("should use provided pagination parameters", async () => {
      req.query.page = "2";
      req.query.limit = "5";
      vi.spyOn(
        TransactionService,
        "findTransactionsByUserId"
      ).mockResolvedValue({
        ...mockTransactions,
        page: 2,
        limit: 5,
      } as any);

      await controller.handleGetTransactions(req, res);

      expect(TransactionService.findTransactionsByUserId).toHaveBeenCalledWith(
        userId,
        2,
        5
      );
    });

    it("should handle service errors", async () => {
      vi.spyOn(
        TransactionService,
        "findTransactionsByUserId"
      ).mockRejectedValue(new Error("DB Error"));

      await controller.handleGetTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "DB Error",
      });
    });

    it("should handle errors that are not instances of Error", async () => {
      vi.spyOn(
        TransactionService,
        "findTransactionsByUserId"
      ).mockRejectedValue("DB Error");

      await controller.handleGetTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to fetch transactions",
      });
    });
  });

  describe("handleGetIncomeExpensesSavings", () => {
    const mockSummary = {
      income: 1000,
      expenses: 500,
      savings: 500,
    };

    it("should return transaction summary", async () => {
      vi.spyOn(
        TransactionService,
        "summarizeTransactionsbyUserId"
      ).mockResolvedValue(mockSummary as any);

      await controller.handleGetIncomeExpensesSavings(req, res);

      expect(
        TransactionService.summarizeTransactionsbyUserId
      ).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        summary: mockSummary,
        success: true,
      });
    });

    it("should handle errors", async () => {
      vi.spyOn(
        TransactionService,
        "summarizeTransactionsbyUserId"
      ).mockRejectedValue(new Error("Summary failed"));

      await controller.handleGetIncomeExpensesSavings(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Summary failed",
      });
    });

    it("should handle non-Error errors", async () => {
      vi.spyOn(
        TransactionService,
        "summarizeTransactionsbyUserId"
      ).mockRejectedValue("Summary failed");

      await controller.handleGetIncomeExpensesSavings(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to fetch income/expenses/savings",
      });
    });
  });

  describe("handleAnalyzeTransactions", () => {
    const mockAnalysis = {
      categories: [],
      trends: [],
    };

    it("should return transaction analysis", async () => {
      vi.spyOn(
        TransactionService,
        "analyzeTransactionsByUserId"
      ).mockResolvedValue(mockAnalysis as any);

      await controller.handleAnalyzeTransactions(req, res);

      expect(
        TransactionService.analyzeTransactionsByUserId
      ).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: mockAnalysis,
        success: true,
      });
    });

    it("should handle analysis errors", async () => {
      vi.spyOn(
        TransactionService,
        "analyzeTransactionsByUserId"
      ).mockRejectedValue(new Error("Analysis failed"));

      await controller.handleAnalyzeTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Analysis failed",
      });
    });

    it("should handle non-Error errors", async () => {
      vi.spyOn(
        TransactionService,
        "analyzeTransactionsByUserId"
      ).mockRejectedValue("Analysis failed");

      await controller.handleAnalyzeTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to analyze transactions",
      });
    });
  });

  describe("handleCreateTransactions", () => {
    const mockTransactions = [
      { amount: 100, description: "Test 1" },
      { amount: -50, description: "Test 2" },
    ];

    it("should create transactions successfully", async () => {
      vi.spyOn(
        TransactionService,
        "createTransactionsByUserId"
      ).mockResolvedValue(undefined);
      req.body = mockTransactions;

      await controller.handleCreateTransactions(req, res);

      expect(
        TransactionService.createTransactionsByUserId
      ).toHaveBeenCalledWith(userId, mockTransactions);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it("should handle creation errors", async () => {
      vi.spyOn(
        TransactionService,
        "createTransactionsByUserId"
      ).mockRejectedValue(new Error("Create failed"));
      req.body = mockTransactions;

      await controller.handleCreateTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Create failed",
      });
    });

    it("should handle non-Error errors", async () => {
      vi.spyOn(
        TransactionService,
        "createTransactionsByUserId"
      ).mockRejectedValue("Create failed");
      req.body = mockTransactions;

      await controller.handleCreateTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to create transactions",
      });
    });
  });

  describe("handleDeleteTransactions", () => {
    const mockTransactionIds = [
      new mongoose.Types.ObjectId().toString(),
      new mongoose.Types.ObjectId().toString(),
    ];

    it("should delete transactions successfully", async () => {
      vi.spyOn(
        TransactionService,
        "deleteTransactionsByUserId"
      ).mockResolvedValue(undefined);
      req.body = mockTransactionIds;

      await controller.handleDeleteTransactions(req, res);

      expect(
        TransactionService.deleteTransactionsByUserId
      ).toHaveBeenCalledWith(userId, mockTransactionIds);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it("should handle deletion errors", async () => {
      vi.spyOn(
        TransactionService,
        "deleteTransactionsByUserId"
      ).mockRejectedValue(new Error("Delete failed"));
      req.body = mockTransactionIds;

      await controller.handleDeleteTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Delete failed",
      });
    });

    it("should handle non-Error errors", async () => {
      vi.spyOn(
        TransactionService,
        "deleteTransactionsByUserId"
      ).mockRejectedValue("Delete failed");
      req.body = mockTransactionIds;

      await controller.handleDeleteTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to delete transactions",
      });
    });
  });
});
