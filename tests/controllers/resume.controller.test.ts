import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { ResumeController } from "$controllers/resume.controller";
import { ResumeService } from "$services/resume.service.js";
import * as uploadUtils from "$utils/upload.utils.js";
import { baseConfig } from "$config/base.config.js";
import mongoose from "mongoose";

// Mock the upload utils
vi.mock("$utils/upload.utils.js", () => ({
  processFileUpload: vi.fn(),
}));

function createFreshReqRes() {
  const req: Partial<Request> = {
    params: {},
    body: {},
    headers: {},
  };

  const res: Partial<Response> = {
    json: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
  };

  const next: NextFunction = vi.fn();

  return { req: req as Request, res: res as Response, next };
}

describe("ResumeController", () => {
  let controller: ResumeController;
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    vi.resetAllMocks();
    controller = new ResumeController();
    const fresh = createFreshReqRes();
    ({ req, res, next } = fresh);

    // Mock logger
    vi.spyOn(baseConfig.logger, "error").mockImplementation(
      () => baseConfig.logger
    );
  });

  describe("handleGetResume", () => {
    const mockResume = {
      _id: new mongoose.Types.ObjectId(),
      url: "https://example.com/resume.pdf",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should return resume when found", async () => {
      vi.spyOn(ResumeService, "getResume").mockResolvedValue(mockResume as any);
      req.params.id = mockResume._id.toString();

      await controller.handleGetResume(req, res, next);

      expect(ResumeService.getResume).toHaveBeenCalledWith(
        mockResume._id.toString()
      );
      expect(res.json).toHaveBeenCalledWith(mockResume);
    });

    it("should return 404 when resume not found", async () => {
      vi.spyOn(ResumeService, "getResume").mockResolvedValue(null);
      req.params.id = "nonexistentId";

      await controller.handleGetResume(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Resume not found",
      });
    });

    it("should handle service errors", async () => {
      const error = new Error("Database error");
      vi.spyOn(ResumeService, "getResume").mockRejectedValue(error);
      req.params.id = "someId";

      await controller.handleGetResume(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("handleCreateOrUpdateResume", () => {
    const mockResume = {
      _id: new mongoose.Types.ObjectId(),
      url: "https://example.com/resume.pdf",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should create resume with valid PDF file", async () => {
      const mockBuffer = Buffer.from("fake pdf content");
      const mockFileInfo = {
        mimeType: "application/pdf",
        filename: "resume.pdf",
      };

      vi.mocked(uploadUtils.processFileUpload).mockImplementation(
        async (_, handler) => {
          return handler(mockBuffer, mockFileInfo as any);
        }
      );

      vi.spyOn(ResumeService, "createResume").mockResolvedValue(
        mockResume as any
      );

      await controller.handleCreateOrUpdateResume(req, res, next);

      expect(ResumeService.createResume).toHaveBeenCalledWith(mockBuffer);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResume,
      });
    });

    it("should reject non-PDF files", async () => {
      const mockBuffer = Buffer.from("fake image content");
      const mockFileInfo = {
        mimeType: "image/jpeg",
        filename: "resume.jpg",
      };

      vi.mocked(uploadUtils.processFileUpload).mockImplementation(
        async (_, handler) => {
          return handler(mockBuffer, mockFileInfo as any);
        }
      );

      await controller.handleCreateOrUpdateResume(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Only PDF files are supported",
        })
      );
    });

    it("should handle upload processing errors", async () => {
      const error = new Error("Upload failed");
      vi.mocked(uploadUtils.processFileUpload).mockRejectedValue(error);

      await controller.handleCreateOrUpdateResume(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(baseConfig.logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Outter Catch")
      );
    });
  });
});
