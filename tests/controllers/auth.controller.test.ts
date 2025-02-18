import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import { AuthController } from "$controllers/auth.controller";
import { baseConfig } from "$config/base.config.js";
import * as authUtils from "$utils/auth.utils.js";
import mongoose from "mongoose";

type MockRequest = Request & {
  xhr?: boolean;
};

function createFreshReqRes() {
  const req: Partial<MockRequest> = {
    user: undefined,
    xhr: false,
    headers: {},
    query: {},
    logout: vi.fn((cb) => cb()),
  };

  const res: Partial<Response> = {
    json: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
    redirect: vi.fn(),
  };

  return {
    req: req as MockRequest,
    res: res as Response,
  };
}

// Mock auth utils at the top level
vi.mock("$utils/auth.utils.js", () => ({
  extractRequestState: vi.fn(),
}));

describe("AuthController", () => {
  let controller: AuthController;
  let req: MockRequest;
  let res: Response;

  beforeEach(() => {
    vi.resetAllMocks();
    controller = new AuthController();
    const fresh = createFreshReqRes();
    ({ req, res } = fresh);

    // Mock baseConfig.logger
    vi.spyOn(baseConfig.logger, "info").mockReturnValue(baseConfig.logger);
  });

  describe("handleLoginSuccess", () => {
    const mockUser = {
      isJohnOwolabiIdogun: false,
      _id: new mongoose.Types.ObjectId(),
      email: "",
      provider: "",
      providerId: 2,
      avatar: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should return JSON response for XHR requests", async () => {
      req.user = mockUser;
      req.xhr = true; // Enable XHR flag

      await controller.handleLoginSuccess(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Login successful",
        user: mockUser,
      });
    });

    it("should return JSON response when Accept header includes application/json", async () => {
      req.user = mockUser;
      req.headers.accept = "application/json";

      await controller.handleLoginSuccess(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Login successful",
        user: mockUser,
      });
    });

    it("should redirect to frontend URL with default path when no state", async () => {
      req.user = mockUser;
      // Mock extractRequestState to return "/"
      vi.mocked(authUtils.extractRequestState).mockReturnValue("/");

      await controller.handleLoginSuccess(req, res);

      const expectedRedirectUrl = `${baseConfig.frontendUrl}/`;
      expect(res.redirect).toHaveBeenCalledWith(expectedRedirectUrl);
      expect(baseConfig.logger.info).toHaveBeenCalledWith(
        expect.stringContaining(expectedRedirectUrl)
      );
    });

    it("should redirect to frontend URL with extracted state path", async () => {
      const mockState = "/dashboard";
      // Set up mock implementation for this specific test
      vi.mocked(authUtils.extractRequestState).mockReturnValue(mockState);

      req.user = mockUser;
      await controller.handleLoginSuccess(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        `${baseConfig.frontendUrl}${mockState}`
      );
      expect(baseConfig.logger.info).toHaveBeenCalledWith(
        expect.stringContaining(mockState)
      );
    });
  });

  describe("handleLoginFailure", () => {
    it("should redirect to login page with error parameter", async () => {
      await controller.handleLoginFailure(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        `${baseConfig.frontendUrl}/finanalyzer/auth/login?error=true`
      );
      expect(baseConfig.logger.info).toHaveBeenCalledWith(
        expect.stringContaining("/finanalyzer/auth/login?error=true")
      );
    });
  });

  describe("handleLogout", () => {
    it("should logout and redirect to default login page", async () => {
      await controller.handleLogout(req, res);

      expect(req.logout).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        `${baseConfig.frontendUrl}/finanalyzer/auth/login`
      );
      expect(baseConfig.logger.info).toHaveBeenCalledWith(
        expect.stringContaining("/finanalyzer/auth/login")
      );
    });

    it("should logout and redirect to specified next path", async () => {
      const nextPath = "/custom-path";
      req.query.next = nextPath;

      await controller.handleLogout(req, res);

      expect(req.logout).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        `${baseConfig.frontendUrl}${nextPath}`
      );
      expect(baseConfig.logger.info).toHaveBeenCalledWith(
        expect.stringContaining(nextPath)
      );
    });
  });
});
