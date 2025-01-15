import { AuthController } from "$controllers/auth.controller.js";
import mongoose from "mongoose";
import { createMockLogger } from "../mocks/logger.mock.js";
import { Request, Response } from "express";
import { Providers } from "$types/misc.types.js";
import { baseConfig } from "$config/base.config.js";

// auth.controller.test.js
describe("Sample Test auth.controller.test.js", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});

describe("AuthController", () => {
  let authController: AuthController;
  let mockReq: Partial<Request> & { xhr?: boolean };
  let mockRes: Partial<Response>;
  beforeEach(() => {
    authController = new AuthController();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn(),
    };
    // Define the type for our mock request
    type MockRequest = Partial<Request> & {
      xhr?: boolean; // Make xhr mutable
    };
    mockReq = {
      user: {
        _id: new mongoose.Types.ObjectId(),
        email: "john@example.com",
        name: "John Doe",
        provider: "google",
        providerId: Providers.GOOGLE,
        avatar: "https://example.com/avatar.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      xhr: false,
      headers: {},
      query: {},
      logout: jest.fn((options?: any, done?: (err: any) => void) => {
        if (typeof options === "function") {
          options(null);
        } else if (done) {
          done(null);
        }
      }),
    } as MockRequest; // Cast to our custom type
  });

  describe("loginSuccess", () => {
    beforeEach(() => {
      baseConfig.logger = createMockLogger();
    });
    it("should return JSON response when xhr is true", async () => {
      mockReq.xhr = true;

      await authController.loginSuccess(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Login successful",
        user: mockReq.user,
      });
    });

    it("should return JSON response when accept header includes application/json", async () => {
      mockReq.headers = { accept: "application/json" };

      await authController.loginSuccess(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Login successful",
        user: mockReq.user,
      });
    });

    it("should redirect to frontend URL with root path when no state parameter", async () => {
      await authController.loginSuccess(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.redirect).toHaveBeenCalledWith(
        `${baseConfig.frontendUrl}/`
      );
    });

    it("should redirect with decoded state parameter", async () => {
      const encodedPath = Buffer.from("/dashboard").toString("base64");
      mockReq.query = { state: encodedPath };

      await authController.loginSuccess(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.redirect).toHaveBeenCalledWith(
        `${baseConfig.frontendUrl}/dashboard`
      );
    });

    it("should handle malformed base64 state parameter", async () => {
      const mockLogger = createMockLogger();
      baseConfig.logger = mockLogger;
      mockReq.query = { state: "invalid-base64!" };

      await authController.loginSuccess(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.redirect).toHaveBeenCalledWith(
        `${baseConfig.frontendUrl}/`
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to decode state parameter:",
        expect.any(Error)
      );
    });

    it("should handle empty string state parameter", async () => {
      mockReq.query = { state: "" };

      await authController.loginSuccess(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.redirect).toHaveBeenCalledWith(
        `${baseConfig.frontendUrl}/`
      );
    });

    it("should handle state parameter with slashes correctly", async () => {
      const path = "/deep/nested/route";
      const encodedPath = Buffer.from(path).toString("base64");
      mockReq.query = { state: encodedPath };

      await authController.loginSuccess(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.redirect).toHaveBeenCalledWith(
        `${baseConfig.frontendUrl}${path}`
      );
    });

    it("should handle missing user object", async () => {
      mockReq.user = undefined;

      await authController.loginSuccess(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.redirect).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it("should handle state parameter with special characters", async () => {
      const path = "/search?q=test&filter=active";
      const encodedPath = Buffer.from(path).toString("base64");
      mockReq.query = { state: encodedPath };

      await authController.loginSuccess(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.redirect).toHaveBeenCalledWith(
        `${baseConfig.frontendUrl}${path}`
      );
    });

    it("should handle state parameter with spaces", async () => {
      const path = "/path with spaces";
      const encodedPath = Buffer.from(path).toString("base64");
      mockReq.query = { state: encodedPath };

      await authController.loginSuccess(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.redirect).toHaveBeenCalledWith(
        `${baseConfig.frontendUrl}${path}`
      );
    });

    it("should handle state parameter with unicode characters", async () => {
      const path = "/path/with/üñîçødë";
      const encodedPath = Buffer.from(path).toString("base64");
      mockReq.query = { state: encodedPath };

      await authController.loginSuccess(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.redirect).toHaveBeenCalledWith(
        `${baseConfig.frontendUrl}${path}`
      );
    });
  });

  describe("loginFailure", () => {
    it("should redirect to login page with error parameter", async () => {
      await authController.loginFailure(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockRes.redirect).toHaveBeenCalledWith(
        `${baseConfig.frontendUrl}/auth/login?error=true`
      );
    });
  });

  describe("logout", () => {
    it("should logout and redirect to login page", async () => {
      await authController.logout(mockReq as Request, mockRes as Response);

      expect(mockReq.logout).toHaveBeenCalled();
      expect(mockRes.redirect).toHaveBeenCalledWith(
        `${baseConfig.frontendUrl}/auth/login`
      );
    });
  });
});
