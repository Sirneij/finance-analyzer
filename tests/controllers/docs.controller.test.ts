import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { EndpointController } from "$controllers/docs.controller";
import { EndpointService } from "$services/docs.services.js";
import mongoose from "mongoose";

function createFreshReqRes() {
  const req: Partial<Request> = {
    params: {},
    body: {},
    query: {},
  };

  const res: Partial<Response> = {
    json: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };

  const next: NextFunction = vi.fn();

  return { req: req as Request, res: res as Response, next };
}

describe("EndpointController", () => {
  let controller: EndpointController;
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    vi.resetAllMocks();
    controller = new EndpointController();
    const fresh = createFreshReqRes();
    ({ req, res, next } = fresh);
  });

  describe("handleCreateDoc", () => {
    const mockEndpoint = {
      _id: new mongoose.Types.ObjectId(),
      name: "Test Endpoint",
      method: "GET",
      path: "/test",
      description: "Test endpoint description",
    };

    it("should create endpoint successfully", async () => {
      vi.spyOn(EndpointService, "createEndpoint").mockResolvedValue(
        mockEndpoint as any
      );
      req.body = mockEndpoint;

      await controller.handleCreateDoc(req, res, next);

      expect(EndpointService.createEndpoint).toHaveBeenCalledWith(mockEndpoint);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        endpoint: mockEndpoint,
        success: true,
      });
    });

    it("should handle errors during creation", async () => {
      const error = new Error("Creation failed");
      vi.spyOn(EndpointService, "createEndpoint").mockRejectedValue(error);

      await controller.handleCreateDoc(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("handleGetDoc", () => {
    const mockEndpoint = {
      _id: new mongoose.Types.ObjectId(),
      name: "Test Endpoint",
    };

    it("should return endpoint when found", async () => {
      vi.spyOn(EndpointService, "getEndpoint").mockResolvedValue(
        mockEndpoint as any
      );
      req.params.id = mockEndpoint._id.toString();

      await controller.handleGetDoc(req, res, next);

      expect(EndpointService.getEndpoint).toHaveBeenCalledWith(
        mockEndpoint._id.toString()
      );
      expect(res.json).toHaveBeenCalledWith({
        endpoint: mockEndpoint,
        success: true,
      });
    });

    it("should return 404 when endpoint not found", async () => {
      vi.spyOn(EndpointService, "getEndpoint").mockResolvedValue(null);
      req.params.id = "nonexistentId";

      await controller.handleGetDoc(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Endpoint not found",
        success: false,
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Fetch failed");
      vi.spyOn(EndpointService, "getEndpoint").mockRejectedValue(error);

      await controller.handleGetDoc(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("handleGetDocs", () => {
    const mockEndpoints = [
      { _id: new mongoose.Types.ObjectId(), name: "Endpoint 1" },
      { _id: new mongoose.Types.ObjectId(), name: "Endpoint 2" },
    ];

    it("should return all endpoints", async () => {
      vi.spyOn(EndpointService, "getAllEndpoints").mockResolvedValue(
        mockEndpoints as any
      );

      await controller.handleGetDocs(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        endpoints: mockEndpoints,
        success: true,
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Fetch failed");
      vi.spyOn(EndpointService, "getAllEndpoints").mockRejectedValue(error);

      await controller.handleGetDocs(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("handleUpdateDoc", () => {
    const mockEndpoint = {
      _id: new mongoose.Types.ObjectId(),
      name: "Updated Endpoint",
    };

    it("should update endpoint successfully", async () => {
      vi.spyOn(EndpointService, "updateEndpoint").mockResolvedValue(
        mockEndpoint as any
      );
      req.params.id = mockEndpoint._id.toString();
      req.body = { name: "Updated Endpoint" };

      await controller.handleUpdateDoc(req, res, next);

      expect(EndpointService.updateEndpoint).toHaveBeenCalledWith(
        mockEndpoint._id.toString(),
        { name: "Updated Endpoint" }
      );
      expect(res.json).toHaveBeenCalledWith(mockEndpoint);
    });

    it("should return 404 when endpoint not found", async () => {
      vi.spyOn(EndpointService, "updateEndpoint").mockResolvedValue(null);
      req.params.id = "nonexistentId";

      await controller.handleUpdateDoc(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Endpoint not found",
        success: false,
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Update failed");
      vi.spyOn(EndpointService, "updateEndpoint").mockRejectedValue(error);

      await controller.handleUpdateDoc(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("handleDeleteDoc", () => {
    it("should delete endpoint successfully", async () => {
      vi.spyOn(EndpointService, "deleteEndpoint").mockResolvedValue(true);
      req.params.id = "validId";

      await controller.handleDeleteDoc(req, res, next);

      expect(EndpointService.deleteEndpoint).toHaveBeenCalledWith("validId");
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledWith({ success: true });
    });

    it("should return 404 when endpoint not found", async () => {
      vi.spyOn(EndpointService, "deleteEndpoint").mockResolvedValue(false);
      req.params.id = "nonexistentId";

      await controller.handleDeleteDoc(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Endpoint not found",
        success: false,
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Deletion failed");
      vi.spyOn(EndpointService, "deleteEndpoint").mockRejectedValue(error);

      await controller.handleDeleteDoc(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
