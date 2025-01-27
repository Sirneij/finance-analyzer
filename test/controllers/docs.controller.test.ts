import { EndpointController } from "$controllers/docs.controller.js";
import { IEndpoint } from "$models/docs.model.js";
import { EndpointService } from "$services/docs.services.js";
import { HttpMethod } from "$types/docs.types.js";
import mongoose from "mongoose";
import { Request, Response } from "express";

// docs.controller.test.js
describe("Sample Test docs.controller.test.js", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});
describe("EndpointController", () => {
  let controller: EndpointController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  const mockEndpoint = {
    _id: new mongoose.Types.ObjectId().toString(),
    path: "/test",
    method: HttpMethod.GET,
    middlewares: [],
    category: "test",
    description: "Test endpoint",
    responses: [],
  } as unknown as IEndpoint;

  beforeEach(() => {
    controller = new EndpointController();
    mockReq = {
      params: { id: mockEndpoint._id },
      body: mockEndpoint,
    } as unknown as Request; // Use double casting to bypass type checking
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    } as unknown as Response;
    mockNext = jest.fn();
  });

  describe("create", () => {
    it("should create endpoint and return 201", async () => {
      jest
        .spyOn(EndpointService, "createEndpoint")
        .mockResolvedValue(mockEndpoint);

      await controller.handleCreateDoc(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockEndpoint);
    });

    it("should pass error to next middleware", async () => {
      const error = new Error("Creation failed");
      jest.spyOn(EndpointService, "createEndpoint").mockRejectedValue(error);

      await controller.handleCreateDoc(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("get", () => {
    it("should return endpoint when found", async () => {
      jest
        .spyOn(EndpointService, "getEndpoint")
        .mockResolvedValue(mockEndpoint);

      await controller.handleGetDoc(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith(mockEndpoint);
    });

    it("should return 404 when endpoint not found", async () => {
      jest.spyOn(EndpointService, "getEndpoint").mockResolvedValue(null);

      await controller.handleGetDoc(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Endpoint not found",
      });
    });
    it("should pass error to next middleware", async () => {
      const error = new Error("Database error");
      jest.spyOn(EndpointService, "getEndpoint").mockRejectedValue(error);

      await controller.handleGetDoc(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getAll", () => {
    it("should return all endpoints", async () => {
      const mockEndpoints = [mockEndpoint];
      jest
        .spyOn(EndpointService, "getAllEndpoints")
        .mockResolvedValue(mockEndpoints);

      await controller.handleGetDocs(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith(mockEndpoints);
    });
    it("should pass error to next middleware", async () => {
      const error = new Error("Database error");
      jest.spyOn(EndpointService, "getAllEndpoints").mockRejectedValue(error);

      await controller.handleGetDocs(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("update", () => {
    it("should update and return endpoint", async () => {
      jest
        .spyOn(EndpointService, "updateEndpoint")
        .mockResolvedValue(mockEndpoint);

      await controller.handleUpdateDoc(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith(mockEndpoint);
    });

    it("should return 404 when endpoint not found", async () => {
      jest.spyOn(EndpointService, "updateEndpoint").mockResolvedValue(null);

      await controller.handleUpdateDoc(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Endpoint not found",
      });
    });
    it("should pass error to next middleware", async () => {
      const error = new Error("Database error");
      jest.spyOn(EndpointService, "updateEndpoint").mockRejectedValue(error);

      await controller.handleUpdateDoc(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("delete", () => {
    it("should delete and return 204", async () => {
      jest.spyOn(EndpointService, "deleteEndpoint").mockResolvedValue(true);

      await controller.handleDeleteDoc(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it("should return 404 when endpoint not found", async () => {
      jest.spyOn(EndpointService, "deleteEndpoint").mockResolvedValue(false);

      await controller.handleDeleteDoc(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Endpoint not found",
      });
    });
    it("should pass error to next middleware", async () => {
      const error = new Error("Database error");
      jest.spyOn(EndpointService, "deleteEndpoint").mockRejectedValue(error);
      await controller.handleDeleteDoc(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
