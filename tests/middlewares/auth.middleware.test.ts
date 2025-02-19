import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import {
  isAuthenticated,
  isJohnOwolabiIdogun,
  handleAuthError,
} from "$middlewares/auth.middleware";
import { ProviderMismatchError } from "$types/error.types.js";
import * as errorUtils from "$utils/error.utils.js";
import mongoose from "mongoose";

function createMockReqRes() {
  const req: Partial<Request> = {
    // @ts-ignore
    isAuthenticated: vi.fn(),
    user: undefined,
    xhr: false,
    headers: {
      accept: "text/html",
    },
  };

  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    redirect: vi.fn().mockReturnThis(), // Add redirect method
    req: req as Request,
  };

  const next: NextFunction = vi.fn();

  return { req: req as Request, res: res as Response, next };
}

describe("Auth Middleware", () => {
  describe("isAuthenticated", () => {
    it("should call next() for authenticated users", () => {
      const { req, res, next } = createMockReqRes();
      (req.isAuthenticated as any).mockReturnValue(true);

      isAuthenticated(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should return 401 for unauthenticated users", () => {
      const { req, res, next } = createMockReqRes();
      (req.isAuthenticated as any).mockReturnValue(false);

      isAuthenticated(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Unauthenticated. Kindly login to proceed.",
      });
    });
  });

  describe("isJohnOwolabiIdogun", () => {
    it("should call next() for authenticated John Owolabi Idogun", () => {
      const { req, res, next } = createMockReqRes();
      (req.isAuthenticated as any).mockReturnValue(true);
      req.user = {
        isJohnOwolabiIdogun: true,
        _id: new mongoose.Types.ObjectId(),
        email: "",
        provider: "",
        providerId: 2,
        avatar: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      isJohnOwolabiIdogun(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should return 403 for non-John Owolabi Idogun users", () => {
      const { req, res, next } = createMockReqRes();
      (req.isAuthenticated as any).mockReturnValue(true);
      req.user = {
        isJohnOwolabiIdogun: false,
        _id: new mongoose.Types.ObjectId(),
        email: "",
        provider: "",
        providerId: 2,
        avatar: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      isJohnOwolabiIdogun(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Forbidden. You are not authorized to perform this action.",
      });
    });

    it("should return 403 for unauthenticated users", () => {
      const { req, res, next } = createMockReqRes();
      (req.isAuthenticated as any).mockReturnValue(false);

      isJohnOwolabiIdogun(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Forbidden. You are not authorized to perform this action.",
      });
    });
  });

  describe("handleAuthError", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("should handle ProviderMismatchError", () => {
      const { req, res, next } = createMockReqRes();
      const error = new ProviderMismatchError("github");
      const sendAuthErrorSpy = vi.spyOn(errorUtils, "sendAuthError");

      handleAuthError(error, req, res, next);

      // Verify sendAuthError was called with correct parameters
      expect(sendAuthErrorSpy).toHaveBeenCalledWith(res, {
        name: "ProviderMismatchError",
        type: "PROVIDER_MISMATCH",
        message: error.message,
        statusCode: 401,
        provider: "github",
      });

      // Verify redirect wasn't called for API requests
      if (req.xhr || req.headers.accept?.includes("application/json")) {
        expect(res.redirect).not.toHaveBeenCalled();
      } else {
        expect(res.redirect).toHaveBeenCalled();
      }

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass through non-auth errors", () => {
      const { req, res, next } = createMockReqRes();
      const error = new Error("Generic error");
      const sendAuthErrorSpy = vi.spyOn(errorUtils, "sendAuthError");

      handleAuthError(error, req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(sendAuthErrorSpy).not.toHaveBeenCalled();
    });
  });
});
