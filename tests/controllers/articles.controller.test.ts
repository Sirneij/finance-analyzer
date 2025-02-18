/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PassThrough } from "stream";
import type { Request, Response, NextFunction } from "express";
import { ArticleController } from "$controllers/article.controller";
import { ArticleService } from "$services/article.service";
import { cloudinaryService } from "$services/db.service";
import * as articleUtils from "$utils/article.utils";
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
    pipe: vi.fn(), // override for file upload tests
  };

  const jsonMock = vi.fn().mockReturnThis();
  const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
  const res: Partial<Response> = { json: jsonMock, status: statusMock };

  const next: NextFunction = vi.fn();
  return { req: req as Request, res: res as Response, next };
}

describe("ArticleController - Comprehensive Tests", () => {
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

  describe("handleGetArticle", () => {
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

    it("should return 400 error if ID is missing", async () => {
      req.params = {};
      await controller.handleGetArticle(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Article ID is required",
      });
    });

    it("should return error if article is not found", async () => {
      req.params = { id: "nonexistentId" };
      vi.spyOn(ArticleService, "getArticleById").mockResolvedValue(null);
      await controller.handleGetArticle(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Article not found",
      });
    });
  });

  describe("handleGetArticles", () => {
    it("should return paginated articles with valid parameters", async () => {
      req.query = { page: "2", limit: "5" };
      const mockResult = createPaginatedArticleResponse(2) as any;
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

    it("should use default pagination values if parameters are invalid", async () => {
      req.query = { page: "invalid", limit: "invalid" };
      const mockResult = createPaginatedArticleResponse() as any;
      vi.spyOn(ArticleService, "getPublishedArticles").mockResolvedValue(
        mockResult
      );

      await controller.handleGetArticles(req, res);

      // Assuming defaults are page 1 and limit 12.
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

    it("should return error when required fields are missing", async () => {
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
    beforeEach(() => {
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

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        uploadResult: mockUploadResult,
      });
    });

    it("should propagate error if file upload fails", async () => {
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

    // Additional edge cases:
    it("should reject if multiple files are uploaded", async () => {
      req.pipe = vi.fn((dest: any) => {
        const fakeFile1 = new PassThrough();
        const info1 = {
          filename: "file1.jpg",
          mimeType: "image/jpeg",
          encoding: "7bit",
        };
        dest.emit("file", "file", fakeFile1, info1);
        fakeFile1.write(Buffer.from("data1"));
        fakeFile1.end();

        // Emit second file event
        const fakeFile2 = new PassThrough();
        const info2 = {
          filename: "file2.jpg",
          mimeType: "image/jpeg",
          encoding: "7bit",
        };
        dest.emit("file", "file", fakeFile2, info2);
        fakeFile2.write(Buffer.from("data2"));
        fakeFile2.end();
        return dest;
      });

      await controller.handleFileUpload(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("handleArticleDelete", () => {
    it("should delete article when valid ID is provided", async () => {
      req.params = { id: "1" };
      vi.spyOn(ArticleService, "deleteArticle").mockResolvedValue(null);

      await controller.handleArticleDelete(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it("should return error if ID is missing", async () => {
      req.params = {};
      await controller.handleArticleDelete(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Article ID is required",
      });
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

    it("should search articles with tags", async () => {
      req.query = { tags: ["tag1", "tag2"], page: "1", limit: "10" };
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

  // Tests for handleFileDelete
  describe("handleFileDelete", () => {
    it("should delete file when a valid URL is provided", async () => {
      req.query = { url: "http://example.com/image.jpg" };
      // Simulate deleteFilesFromCloudinary returning some result.
      const deleteResult = { result: "deleted", count: 1 };
      vi.spyOn(articleUtils, "deleteFilesFromCloudinary").mockResolvedValue(
        deleteResult
      );

      await controller.handleFileDelete(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...deleteResult,
      });
    });

    it("should return error if URL is missing", async () => {
      req.query = {};
      await controller.handleFileDelete(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "image URL is required",
      });
    });

    it("should handle errors from deleteFilesFromCloudinary", async () => {
      req.query = { url: "http://example.com/image.jpg" };
      vi.spyOn(articleUtils, "deleteFilesFromCloudinary").mockRejectedValue(
        new Error("Delete failed")
      );

      await controller.handleFileDelete(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Delete failed",
      });
    });
  });

  // Tests for handleArticleUpdate
  describe("handleArticleUpdate", () => {
    it("should update article with valid input", async () => {
      req.params = { id: "articleId" };
      req.body = {
        title: "New Title",
        foreImage: "http://example.com/new.jpg",
        content: "Updated content",
        tags: ["tag1", "tag2"],
        series: "seriesId",
        isPublished: true,
      };

      const updatedArticle = createArticleResponse({
        title: "New Title",
        foreImage: "http://example.com/new.jpg",
        content: "Updated content",
        tags: ["tag1", "tag2"],
        series: "seriesId",
        isPublished: true,
      }) as any;

      vi.spyOn(ArticleService, "updateArticle").mockResolvedValue(
        updatedArticle
      );

      await controller.handleArticleUpdate(req, res);

      expect(ArticleService.updateArticle).toHaveBeenCalledWith(
        "articleId",
        expect.objectContaining({
          title: "New Title",
          foreImage: "http://example.com/new.jpg",
          content: "Updated content",
          isPublished: true,
          // slug is generated based on title.
        })
      );

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        article: updatedArticle,
      });
    });

    it("should handle errors during article update", async () => {
      req.params = { id: "articleId" };
      req.body = { title: "New Title" };
      vi.spyOn(ArticleService, "updateArticle").mockRejectedValue(
        new Error("Update failed")
      );

      await controller.handleArticleUpdate(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Update failed",
      });
    });
  });

  // Tests for handleBatchArticleDelete
  describe("handleBatchArticleDelete", () => {
    it("should delete multiple articles when valid array is provided", async () => {
      req.body = { ids: ["id1", "id2"] };
      const result = { deletedCount: 2 } as any;
      vi.spyOn(ArticleService, "deleteManyArticles").mockResolvedValue(result);

      await controller.handleBatchArticleDelete(req, res);

      expect(ArticleService.deleteManyArticles).toHaveBeenCalledWith([
        "id1",
        "id2",
      ]);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        result,
      });
    });

    it("should return error if ids array is missing or empty", async () => {
      req.body = { ids: [] };
      await controller.handleBatchArticleDelete(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Article IDs array is required",
      });
    });

    it("should handle errors during batch deletion", async () => {
      req.body = { ids: ["id1", "id2"] };
      vi.spyOn(ArticleService, "deleteManyArticles").mockRejectedValue(
        new Error("Batch delete failed")
      );
      await controller.handleBatchArticleDelete(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Batch delete failed",
      });
    });
  });

  // Tests for handleTogglePublish
  describe("handleTogglePublish", () => {
    it("should toggle publish status for multiple articles", async () => {
      req.body = { ids: ["id1", "id2"] };
      const result = { toggledCount: 2 } as any;
      vi.spyOn(ArticleService, "togglePublishManyArticles").mockResolvedValue(
        result
      );

      await controller.handleTogglePublish(req, res);

      expect(ArticleService.togglePublishManyArticles).toHaveBeenCalledWith([
        "id1",
        "id2",
      ]);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        result,
      });
    });

    it("should return error if ids array is missing or empty", async () => {
      req.body = { ids: [] };
      await controller.handleTogglePublish(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Article IDs array is required",
      });
    });

    it("should handle errors during toggling publish", async () => {
      req.body = { ids: ["id1", "id2"] };
      vi.spyOn(ArticleService, "togglePublishManyArticles").mockRejectedValue(
        new Error("Toggle failed")
      );
      await controller.handleTogglePublish(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Toggle failed",
      });
    });
  });

  // Tests for handleGetAllArticles
  describe("handleGetAllArticles", () => {
    it("should return all articles with valid pagination", async () => {
      req.query = { page: "3", limit: "15" };
      const result = createPaginatedArticleResponse(3) as any;
      vi.spyOn(ArticleService, "getAllArticles").mockResolvedValue(result);

      await controller.handleGetAllArticles(req, res);

      expect(ArticleService.getAllArticles).toHaveBeenCalledWith(3, 15);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        articles: result.articles,
        metadata: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    });

    it("should use default pagination if parameters are invalid", async () => {
      req.query = { page: "NaN", limit: "NaN" };
      const result = createPaginatedArticleResponse() as any;
      vi.spyOn(ArticleService, "getAllArticles").mockResolvedValue(result);

      await controller.handleGetAllArticles(req, res);

      // Assuming defaults are page 1 and limit 12.
      expect(ArticleService.getAllArticles).toHaveBeenCalledWith(1, 12);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        articles: result.articles,
        metadata: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    });

    it("should handle errors during fetching all articles", async () => {
      req.query = { page: "1", limit: "12" };
      vi.spyOn(ArticleService, "getAllArticles").mockRejectedValue(
        new Error("Fetch failed")
      );
      await controller.handleGetAllArticles(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Fetch failed",
      });
    });
  });

  // Tests for handleGetArticleStats
  describe("handleGetArticleStats", () => {
    it("should return article stats", async () => {
      const stats = { totalArticles: 10, totalViews: 1000 } as any;
      vi.spyOn(ArticleService, "getArticleStats").mockResolvedValue(stats);

      await controller.handleGetArticleStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        stats,
      });
    });

    it("should handle errors during fetching article stats", async () => {
      vi.spyOn(ArticleService, "getArticleStats").mockRejectedValue(
        new Error("Stats failed")
      );
      await controller.handleGetArticleStats(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Stats failed",
      });
    });
  });
});
