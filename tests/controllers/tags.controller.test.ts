import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import { TagsController } from "$controllers/tags.controller";
import { TagsService } from "$services/tags.service.js";
import mongoose from "mongoose";

function createFreshReqRes() {
  const req: Partial<Request> = {
    params: {},
    query: {},
    body: {},
  };

  const res: Partial<Response> = {
    json: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };

  return { req: req as Request, res: res as Response };
}

describe("TagsController", () => {
  let controller: TagsController;
  let req: Request;
  let res: Response;

  beforeEach(() => {
    vi.resetAllMocks();
    controller = new TagsController();
    const fresh = createFreshReqRes();
    ({ req, res } = fresh);

    // Mock console.error to avoid cluttering test output
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("handleGetATag", () => {
    const mockTag = {
      _id: new mongoose.Types.ObjectId(),
      name: "test-tag",
      description: "Test description",
    };

    it("should return tag when found", async () => {
      vi.spyOn(TagsService, "getTagById").mockResolvedValue(mockTag as any);
      req.params.id = mockTag._id.toString();

      await controller.handleGetATag(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        tag: mockTag,
        success: true,
      });
    });

    it("should return 400 for invalid ObjectId", async () => {
      req.params.id = "invalid-id";

      await controller.handleGetATag(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid tag ID format",
        success: false,
      });
    });

    it("should return 404 when tag not found", async () => {
      vi.spyOn(TagsService, "getTagById").mockResolvedValue(null);
      req.params.id = new mongoose.Types.ObjectId().toString();

      await controller.handleGetATag(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tag not found",
        success: false,
      });
    });

    it("should handle service errors", async () => {
      vi.spyOn(TagsService, "getTagById").mockRejectedValue(
        new Error("DB Error")
      );
      req.params.id = new mongoose.Types.ObjectId().toString();

      await controller.handleGetATag(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
        success: false,
      });
    });
  });

  describe("handleGetTags", () => {
    const mockPaginatedResult = {
      tags: [
        { _id: new mongoose.Types.ObjectId(), name: "tag1" },
        { _id: new mongoose.Types.ObjectId(), name: "tag2" },
      ],
      total: 2,
      page: 1,
      limit: 10,
    };

    it("should return paginated tags with default values", async () => {
      vi.spyOn(TagsService, "getTags").mockResolvedValue(
        mockPaginatedResult as any
      );

      await controller.handleGetTags(req, res);

      expect(TagsService.getTags).toHaveBeenCalledWith(1, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        tags: mockPaginatedResult.tags,
        metadata: {
          total: mockPaginatedResult.total,
          page: mockPaginatedResult.page,
          limit: mockPaginatedResult.limit,
          totalPages: Math.ceil(
            mockPaginatedResult.total / mockPaginatedResult.limit
          ),
        },
      });
    });

    it("should use provided pagination parameters", async () => {
      vi.spyOn(TagsService, "getTags").mockResolvedValue({
        ...mockPaginatedResult,
        page: 2,
        limit: 5,
      } as any);
      req.query.page = "2";
      req.query.limit = "5";

      await controller.handleGetTags(req, res);

      expect(TagsService.getTags).toHaveBeenCalledWith(2, 5);
    });

    it("should handle service errors", async () => {
      vi.spyOn(TagsService, "getTags").mockRejectedValue(new Error("DB Error"));

      await controller.handleGetTags(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
        success: false,
      });
    });
  });

  describe("handleCreateTags", () => {
    const mockTags = [
      { name: "TAG1", description: "Description 1" },
      { name: "TAG2", description: "Description 2" },
    ];

    it("should create tags successfully and convert names to lowercase", async () => {
      const lowercaseTags = mockTags.map((tag) => ({
        ...tag,
        name: tag.name.toLowerCase(),
      }));
      vi.spyOn(TagsService, "createTags").mockResolvedValue(
        lowercaseTags as any
      );
      req.body = mockTags;

      await controller.handleCreateTags(req, res);

      expect(TagsService.createTags).toHaveBeenCalledWith(lowercaseTags);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        tags: lowercaseTags,
      });
    });

    it("should handle duplicate tag names", async () => {
      const duplicateError = new Error("Duplicate key") as any;
      duplicateError.code = 11000;
      vi.spyOn(TagsService, "createTags").mockRejectedValue(duplicateError);
      req.body = mockTags;

      await controller.handleCreateTags(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Duplicate tag name",
      });
    });

    it("should handle invalid request body", async () => {
      req.body = "invalid";

      await controller.handleCreateTags(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid request body",
      });
    });
  });

  describe("handleUpdateTag", () => {
    const mockTag = {
      _id: new mongoose.Types.ObjectId(),
      name: "updated-tag",
      description: "Updated description",
    };

    it("should update tag successfully", async () => {
      vi.spyOn(TagsService, "updateTag").mockResolvedValue(mockTag as any);
      req.params.id = mockTag._id.toString();
      req.body = { name: "updated-tag" };

      await controller.handleUpdateTag(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        tag: mockTag,
        success: true,
      });
    });

    it("should handle invalid ObjectId", async () => {
      req.params.id = "invalid-id";
      req.body = { name: "updated-tag" };

      await controller.handleUpdateTag(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid tag ID format",
        success: false,
      });
    });

    it("should handle empty update data", async () => {
      req.params.id = mockTag._id.toString();
      req.body = {};

      await controller.handleUpdateTag(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "No update data provided",
        success: false,
      });
    });

    it("should handle duplicate tag names", async () => {
      const duplicateError = new Error("Duplicate key") as any;
      duplicateError.code = 11000;
      vi.spyOn(TagsService, "updateTag").mockRejectedValue(duplicateError);
      req.params.id = mockTag._id.toString();
      req.body = { name: "existing-tag" };

      await controller.handleUpdateTag(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Duplicate tag name",
        success: false,
      });
    });
  });

  describe("handleDeleteTag", () => {
    it("should delete tag successfully", async () => {
      const mockId = new mongoose.Types.ObjectId().toString();
      vi.spyOn(TagsService, "deleteTag").mockResolvedValue(true as any);
      req.params.id = mockId;

      await controller.handleDeleteTag(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        deleted: true,
      });
    });

    it("should handle invalid ObjectId", async () => {
      req.params.id = "invalid-id";

      await controller.handleDeleteTag(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid tag ID format",
        success: false,
      });
    });

    it("should handle service errors", async () => {
      vi.spyOn(TagsService, "deleteTag").mockRejectedValue(
        new Error("DB Error")
      );
      req.params.id = new mongoose.Types.ObjectId().toString();

      await controller.handleDeleteTag(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
        success: false,
      });
    });
  });
});
