/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PassThrough } from "stream";
import type { Request, Response, NextFunction } from "express";
import { ArticleController } from "$controllers/article.controller";
import { ArticleService } from "$services/article.service";
import { cloudinaryService } from "$services/db.service";
import {
  createArticleResponse,
  createArticleInput,
  createPaginatedArticleResponse,
} from "../factories/article.factory";

// Mock Busboy so that processFileUpload returns a controlled instance.
vi.mock("busboy", () => {
  const { PassThrough } = require("stream");
  return {
    __esModule: true,
    default: PassThrough,
  };
});

function createFreshReqRes() {
  const req: Partial<Request> = {
    params: {},
    query: {},
    body: {},
    headers: {},
    pipe: vi.fn(), // this may be overridden for file upload tests
  };

  // Create fresh spies for res.json and res.status each time.
  const jsonMock = vi.fn().mockReturnThis();
  const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
  const res: Partial<Response> = {
    json: jsonMock,
    status: statusMock,
  };

  // Create a no‑op next.
  const next: NextFunction = vi.fn();

  return { req: req as Request, res: res as Response, next };
}

describe("ArticleController", () => {
  describe("handleGetArticle", () => {
    let controller: ArticleController;
    let req: Request;
    let res: Response;
    let next: NextFunction;

    beforeEach(() => {
      vi.resetAllMocks();
      controller = new ArticleController();
      const fresh = createFreshReqRes();
      ({ req, res, next } = fresh);
    });

    it("should return article when valid ID is provided", async () => {
      const mockArticle = createArticleResponse() as any;
      req.params = { id: mockArticle._id };
      vi.spyOn(ArticleService, "getArticleById").mockResolvedValue(mockArticle);

      await controller.handleGetArticle(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        article: mockArticle,
      });
    });

    it("should handle missing article ID", async () => {
      req.params = {};
      await controller.handleGetArticle(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Article ID is required",
      });
    });
  });

  describe("handleGetArticles", () => {
    let controller: ArticleController;
    let req: Request;
    let res: Response;
    let next: NextFunction;

    beforeEach(() => {
      vi.resetAllMocks();
      controller = new ArticleController();
      const fresh = createFreshReqRes();
      ({ req, res, next } = fresh);
    });

    it("should return paginated articles", async () => {
      const mockResult = createPaginatedArticleResponse() as any;
      vi.spyOn(ArticleService, "getPublishedArticles").mockResolvedValue(
        mockResult
      );

      await controller.handleGetArticles(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        articles: mockResult.articles,
        metadata: {
          total: mockResult.total,
          page: mockResult.page,
          limit: mockResult.limit,
          totalPages: Math.ceil(mockResult.total / mockResult.limit),
        },
      });
    });
  });

  describe("handleArticleCreate", () => {
    let controller: ArticleController;
    let req: Request;
    let res: Response;
    let next: NextFunction;

    beforeEach(() => {
      vi.resetAllMocks();
      controller = new ArticleController();
      const fresh = createFreshReqRes();
      ({ req, res, next } = fresh);
    });

    it("should create article with valid input", async () => {
      const mockInput = createArticleInput();
      req.body = mockInput;
      const createdArticle = createArticleResponse(mockInput) as any;
      vi.spyOn(ArticleService, "createArticle").mockResolvedValue(
        createdArticle
      );

      await controller.handleArticleCreate(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        article: createdArticle,
      });
    });

    it("should handle missing required fields", async () => {
      req.body = { title: "Test" };

      await controller.handleArticleCreate(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Title, content, tags, and foreImage are required",
      });
    });
  });

  describe("handleFileUpload", () => {
    let controller: ArticleController;
    let req: Request;
    let res: Response;
    let next: NextFunction;

    beforeEach(() => {
      vi.resetAllMocks();
      controller = new ArticleController();
      const fresh = createFreshReqRes();
      ({ req, res, next } = fresh);
      req.headers = { "content-type": "multipart/form-data" };
    });

    it("should upload a file successfully", async () => {
      const mockUploadResult = { secure_url: "http://example.com/image.jpg" };

      vi.spyOn(cloudinaryService, "getCloudinary").mockReturnValue({
        uploader: {
          upload_stream: vi.fn().mockImplementation((options, callback) => {
            callback(null, mockUploadResult);
            return { end: vi.fn() };
          }),
        },
      } as any);

      // Override req.pipe to simulate Busboy (which is now a PassThrough) events.
      req.pipe = vi.fn((dest: any) => {
        const fakeFile = new PassThrough();
        const info = {
          filename: "image.jpg",
          mimeType: "image/jpeg",
          encoding: "7bit",
        };
        // Emit the "file" event on the Busboy (dest) instance.
        dest.emit("file", "file", fakeFile, info);
        // Simulate file data.
        fakeFile.write(Buffer.from("image data"));
        fakeFile.end();
        return dest;
      });

      await controller.handleFileUpload(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        uploadResult: mockUploadResult,
      });
    });

    it("should handle file upload error", async () => {
      vi.spyOn(cloudinaryService, "getCloudinary").mockReturnValue({
        uploader: {
          upload_stream: vi.fn().mockImplementation((options, callback) => {
            callback(new Error("Upload failed"), null);
            return { end: vi.fn() };
          }),
        },
      } as any);

      req.pipe = vi.fn((dest: any) => {
        const fakeFile = new PassThrough();
        const info = {
          filename: "image.jpg",
          mimeType: "image/jpeg",
          encoding: "7bit",
        };
        dest.emit("file", "file", fakeFile, info);
        fakeFile.write(Buffer.from("image data"));
        fakeFile.end();
        return dest;
      });

      await controller.handleFileUpload(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("handleArticleDelete", () => {
    let controller: ArticleController;
    let req: Request;
    let res: Response;
    let next: NextFunction;

    beforeEach(() => {
      vi.resetAllMocks();
      controller = new ArticleController();
      const fresh = createFreshReqRes();
      ({ req, res, next } = fresh);
    });

    it("should delete article with valid ID", async () => {
      req.params = { id: "1" };
      vi.spyOn(ArticleService, "deleteArticle").mockResolvedValue(null);

      await controller.handleArticleDelete(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
  });

  describe("handleSearchArticles", () => {
    let controller: ArticleController;
    let req: Request;
    let res: Response;
    let next: NextFunction;

    beforeEach(() => {
      vi.resetAllMocks();
      controller = new ArticleController();
      const fresh = createFreshReqRes();
      ({ req, res, next } = fresh);
    });

    it("should search articles with given parameters", async () => {
      req.query = { search: "test", page: "1", limit: "10" };
      const mockResult = createPaginatedArticleResponse(2) as any;
      vi.spyOn(ArticleService, "searchArticles").mockResolvedValue(mockResult);

      await controller.handleSearchArticles(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        articles: mockResult.articles,
        metadata: {
          total: mockResult.total,
          page: mockResult.page,
          limit: mockResult.limit,
          totalPages: Math.ceil(mockResult.total / mockResult.limit),
        },
      });
    });
  });
});
