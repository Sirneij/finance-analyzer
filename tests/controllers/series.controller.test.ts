import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import { SeriesController } from "$controllers/series.controller";
import { SeriesService } from "$services/series.service.js";
import { baseConfig } from "$config/base.config.js";
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
  };

  return { req: req as Request, res: res as Response };
}

describe("SeriesController", () => {
  let controller: SeriesController;
  let req: Request;
  let res: Response;

  beforeEach(() => {
    vi.resetAllMocks();
    controller = new SeriesController();
    const fresh = createFreshReqRes();
    ({ req, res } = fresh);

    // Mock logger
    vi.spyOn(baseConfig.logger, "info").mockReturnValue(baseConfig.logger);
  });

  describe("handleGetSingleSeries", () => {
    const mockSeries = {
      _id: new mongoose.Types.ObjectId(),
      title: "Test Series",
      description: "Test Description",
    };

    it("should return series when found", async () => {
      vi.spyOn(SeriesService, "getSeriesById").mockResolvedValue(
        mockSeries as any
      );
      req.params.id = mockSeries._id.toString();

      await controller.handleGetSingleSeries(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        series: mockSeries,
        success: true,
      });
    });

    it("should return 404 when series not found", async () => {
      vi.spyOn(SeriesService, "getSeriesById").mockResolvedValue(null);
      req.params.id = "nonexistentId";

      await controller.handleGetSingleSeries(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Series not found",
        success: false,
      });
    });

    it("should handle service errors", async () => {
      vi.spyOn(SeriesService, "getSeriesById").mockRejectedValue(new Error());
      req.params.id = "someId";

      await controller.handleGetSingleSeries(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
        success: false,
      });
    });
  });

  describe("handleGetSeries", () => {
    const mockPaginatedResult = {
      series: [
        { _id: new mongoose.Types.ObjectId(), title: "Series 1" },
        { _id: new mongoose.Types.ObjectId(), title: "Series 2" },
      ],
      total: 2,
      page: 1,
      limit: 10,
    };

    it("should return paginated series with default values", async () => {
      vi.spyOn(SeriesService, "getSeries").mockResolvedValue(
        mockPaginatedResult as any
      );

      await controller.handleGetSeries(req, res);

      expect(SeriesService.getSeries).toHaveBeenCalledWith(1, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        series: mockPaginatedResult.series,
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
      vi.spyOn(SeriesService, "getSeries").mockResolvedValue({
        ...mockPaginatedResult,
        page: 2,
        limit: 5,
      } as any);
      req.query.page = "2";
      req.query.limit = "5";

      await controller.handleGetSeries(req, res);

      expect(SeriesService.getSeries).toHaveBeenCalledWith(2, 5);
    });

    it("should handle errors from service", async () => {
      vi.spyOn(SeriesService, "getSeries").mockRejectedValue(
        new Error("Internal server error")
      );

      await controller.handleGetSeries(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal server error",
      });
    });

    it("should handle errors that are not instances of Error", async () => {
      vi.spyOn(SeriesService, "getSeries").mockRejectedValue("Error");

      await controller.handleGetSeries(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to get series",
      });
    });
  });

  describe("handleCreateSeries", () => {
    const mockSeriesData = [
      { title: "Series 1", description: "Description 1" },
      { title: "Series 2", description: "Description 2" },
    ];

    it("should create series successfully", async () => {
      vi.spyOn(SeriesService, "createSeries").mockResolvedValue(
        mockSeriesData as any
      );
      req.body = mockSeriesData;

      await controller.handleCreateSeries(req, res);

      expect(baseConfig.logger.info).toHaveBeenCalled();
      expect(SeriesService.createSeries).toHaveBeenCalledWith(mockSeriesData);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        series: mockSeriesData,
      });
    });

    it("should handle invalid request body", async () => {
      req.body = "invalid"; // Not an array

      await controller.handleCreateSeries(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid request body",
      });
    });

    it("should handle errors from service", async () => {
      req.body = mockSeriesData;
      vi.spyOn(SeriesService, "createSeries").mockRejectedValue(
        new Error("Internal server error")
      );

      await controller.handleCreateSeries(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal server error",
      });
    });

    it("should handle errors that are not instances of Error", async () => {
      req.body = mockSeriesData;
      vi.spyOn(SeriesService, "createSeries").mockRejectedValue("Error");

      await controller.handleCreateSeries(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to create series",
      });
    });
  });

  describe("handleUpdateManySeries", () => {
    const mockUpdateData = [
      { _id: new mongoose.Types.ObjectId(), title: "Updated Series 1" },
      { _id: new mongoose.Types.ObjectId(), title: "Updated Series 2" },
    ];

    it("should update series successfully", async () => {
      vi.spyOn(SeriesService, "updateManySeries").mockResolvedValue(
        mockUpdateData as any
      );
      req.body = mockUpdateData;

      await controller.handleUpdateManySeries(req, res);

      expect(baseConfig.logger.info).toHaveBeenCalled();
      expect(SeriesService.updateManySeries).toHaveBeenCalledWith(
        mockUpdateData
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        series: mockUpdateData,
      });
    });

    it("should handle invalid request body", async () => {
      req.body = "invalid"; // Not an array

      await controller.handleUpdateManySeries(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid request body",
      });
    });

    it("should handle errors from service", async () => {
      req.body = mockUpdateData;
      vi.spyOn(SeriesService, "updateManySeries").mockRejectedValue(
        new Error("Internal server error")
      );

      await controller.handleUpdateManySeries(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal server error",
      });
    });

    it("should handle errors that are not instances of Error", async () => {
      req.body = mockUpdateData;
      vi.spyOn(SeriesService, "updateManySeries").mockRejectedValue("Error");

      await controller.handleUpdateManySeries(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to update series",
      });
    });
  });

  describe("handleDeleteManySeries", () => {
    const mockIds = [
      new mongoose.Types.ObjectId().toString(),
      new mongoose.Types.ObjectId().toString(),
    ];

    it("should delete series successfully", async () => {
      vi.spyOn(SeriesService, "deleteManySeries").mockResolvedValue(
        mockIds as any
      );
      req.body = { ids: mockIds };

      await controller.handleDeleteManySeries(req, res);

      expect(baseConfig.logger.info).toHaveBeenCalled();
      expect(SeriesService.deleteManySeries).toHaveBeenCalledWith(mockIds);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        series: mockIds,
      });
    });

    it("should handle invalid request body", async () => {
      req.body = { ids: "invalid" }; // Not an array

      await controller.handleDeleteManySeries(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid request body",
      });
    });

    it("should handle errors from service", async () => {
      req.body = { ids: mockIds };
      vi.spyOn(SeriesService, "deleteManySeries").mockRejectedValue(
        new Error("Internal server error")
      );

      await controller.handleDeleteManySeries(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal server error",
      });
    });

    it("should handle errors that are not instances of Error", async () => {
      req.body = { ids: mockIds };
      vi.spyOn(SeriesService, "deleteManySeries").mockRejectedValue("Error");

      await controller.handleDeleteManySeries(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to delete series",
      });
    });
  });
});
