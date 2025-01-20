import { TransactionController } from "$controllers/transaction.controller.js";
import { TransactionService } from "$services/transaction.service.js";
import { FinancialSummary, SpendingReport } from "$types/transaction.types.js";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { Readable } from "stream";

// transaction.controller.test.js
describe("Sample Test transaction.controller.test.js", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});
jest.mock("$services/transaction.service");

describe("TransactionController", () => {
  let controller: TransactionController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    controller = new TransactionController();
    jsonMock = jest.fn();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jsonMock,
    };
    mockRequest = {
      user: {
        _id: new mongoose.Types.ObjectId(),
        email: "",
        provider: "",
        providerId: 0,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("handleFileUpload", () => {
    it("should successfully process uploaded file", async () => {
      const mockBuffer = Buffer.from("test data");
      const mockStream = new Readable();
      mockStream.push(mockBuffer);
      mockStream.push(null);

      // Add proper boundary to content-type
      mockRequest.headers = {
        "content-type":
          "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
      };

      mockRequest.pipe = jest.fn().mockImplementation((dest) => {
        dest.emit("file", "fieldname", mockStream, { mimeType: "text/csv" });
      });

      jest.spyOn(TransactionService, "processFile").mockResolvedValue({
        data: [],
        mimeType: "text/csv",
      });

      await controller.handleFileUpload(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: [],
        mimeType: "text/csv",
      });
    });

    it("should handle busboy errors", async () => {
      mockRequest.headers = {
        "content-type": "multipart/form-data; boundary=boundary",
      };

      mockRequest.pipe = jest.fn().mockImplementation((dest) => {
        // Wrap error emission in setTimeout to allow promise to set up
        setTimeout(() => {
          dest.emit("error", new Error("Upload error"));
        }, 0);
        return dest;
      });

      await controller.handleFileUpload(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: "Upload error",
      });
    });
  });

  describe("getTransactions", () => {
    it("should return transactions with pagination", async () => {
      mockRequest.query = { page: "1", limit: "10" };
      const mockResult = {
        transactions: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(TransactionService, "findTransactionsByUserId")
        .mockResolvedValue(mockResult);

      await controller.getTransactions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonMock).toHaveBeenCalledWith({
        data: mockResult.transactions,
        metadata: {
          total: mockResult.total,
          page: mockResult.page,
          limit: mockResult.limit,
          totalPages: 0,
        },
      });
    });

    it("should handle service errors", async () => {
      // Add required query parameters
      mockRequest.query = {
        page: "1",
        limit: "10",
      };

      jest
        .spyOn(TransactionService, "findTransactionsByUserId")
        .mockRejectedValue(new Error("Service error"));

      await controller.getTransactions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: "Service error",
      });
    });
  });

  describe("getIncomeExpensesSavings", () => {
    it("should return transaction summary", async () => {
      const mockSummary: FinancialSummary = {
        income: {
          total: 1000,
          change: 100,
          trend: "up",
        },
        expenses: {
          total: 500,
          change: -50,
          trend: "down",
        },
        savings: {
          total: 500,
          change: 150,
          trend: "up",
        },
        total_transactions: 10,
        expense_count: 3,
        income_count: 5,
        avg_expense: 166.67,
        avg_income: 200,
        start_date: "2024-01-01",
        end_date: "2024-03-31",
        largest_expense: 250,
        largest_income: 300,
        savings_rate: 0.5,
        monthly_summary: {
          "2024-01": { income: 400, expenses: 200, savings: 200 },
          "2024-02": { income: 300, expenses: 150, savings: 150 },
          "2024-03": { income: 300, expenses: 150, savings: 150 },
        },
      };
      jest
        .spyOn(TransactionService, "summarizeTransactionsbyUserId")
        .mockResolvedValue(mockSummary);

      await controller.getIncomeExpensesSavings(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonMock).toHaveBeenCalledWith(mockSummary);
    });

    it("should handle service errors", async () => {
      jest
        .spyOn(TransactionService, "summarizeTransactionsbyUserId")
        .mockRejectedValue(new Error("Service error"));

      await controller.getIncomeExpensesSavings(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: "Service error",
      });
    });
  });

  describe("analyzeTransactions", () => {
    it("should return transaction analysis", async () => {
      const mockAnalysis: SpendingReport = {
        categories: {
          categories: {
            Groceries: 100,
            Rent: 1000,
            Utilities: 200,
          },
          percentages: {
            Groceries: 0.1,
            Rent: 0.5,
            Utilities: 0.1,
          },
        },
        anomalies: [
          {
            date: "2024-01-01",
            description: "Anomaly",
            amount: 1000,
            reason: "Unexpected rent increase",
          },
        ],
        spending_analysis: {
          total_spent: 1000,
          total_income: 2000,
          savings_rate: 0.5,
          daily_summary: {
            "2024-01-01": 100,
            "2024-01-02": 200,
            "2024-01-03": 300,
          },
          cumulative_balance: {
            "2024-01-01": 100,
            "2024-01-02": 300,
            "2024-01-03": 600,
          },
        },
        spending_trends: {
          trend: "increasing",
          trend_slope: 0.5,
          estimated_monthly_spend: 1000,
        },
      };
      jest
        .spyOn(TransactionService, "analyzeTransactionsByUserId")
        .mockResolvedValue(mockAnalysis);

      await controller.analyzeTransactions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonMock).toHaveBeenCalledWith(mockAnalysis);
    });

    it("should handle service errors", async () => {
      jest
        .spyOn(TransactionService, "analyzeTransactionsByUserId")
        .mockRejectedValue(new Error("Service error"));

      await controller.analyzeTransactions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: "Service error",
      });
    });
  });

  describe("createTransactions", () => {
    it("should create transactions successfully", async () => {
      mockRequest.body = [{ amount: 100, description: "Test" }];
      jest
        .spyOn(TransactionService, "createTransactionsByUserId")
        .mockResolvedValue(undefined);

      await controller.createTransactions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonMock).toHaveBeenCalledWith({ success: true });
    });

    it("should handle service errors", async () => {
      mockRequest.body = [{ amount: 100, description: "Test" }];
      jest
        .spyOn(TransactionService, "createTransactionsByUserId")
        .mockRejectedValue(new Error("Service error"));

      await controller.createTransactions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: "Service error",
      });
    });
  });

  describe("deleteTransactions", () => {
    it("should delete transactions successfully", async () => {
      mockRequest.body = ["transactionId1", "transactionId2"];
      jest
        .spyOn(TransactionService, "deleteTransactionsByUserId")
        .mockResolvedValue(undefined);

      await controller.deleteTransactions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonMock).toHaveBeenCalledWith({ success: true });
    });
  });

  it("should handle service errors", async () => {
    mockRequest.body = ["transactionId1", "transactionId2"];
    jest
      .spyOn(TransactionService, "deleteTransactionsByUserId")
      .mockRejectedValue(new Error("Service error"));

    await controller.deleteTransactions(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: "Service error",
    });
  });
});
