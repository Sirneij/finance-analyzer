import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import app from "../../src/app";
import { BASE_URL } from "../setupEnv";
import passport from "passport";
import { AuthController } from "$controllers/auth.controller";
import type { Request, Response, NextFunction } from "express";

// Set up mocks before any imports that might use them
vi.mock("$controllers/auth.controller", () => {
  const controller = {
    handleLoginSuccess: vi.fn((req, res) => res.json({ success: true })),
    handleLoginFailure: vi.fn((req, res) =>
      res.status(401).json({ success: false })
    ),
    handleLogout: vi.fn((req, res) => res.json({ success: true })),
  };

  return {
    AuthController: vi.fn().mockImplementation(() => controller),
  };
});

// Mock passport
vi.mock("passport", () => ({
  default: {
    authenticate: vi.fn(
      (strategy, options) =>
        (req: Request, res: Response, next: NextFunction) =>
          next()
    ),
    initialize: vi.fn(
      () => (req: Request, res: Response, next: NextFunction) => next()
    ),
    session: vi.fn(
      () => (req: Request, res: Response, next: NextFunction) => next()
    ),
    serializeUser: vi.fn((fn) => fn),
    deserializeUser: vi.fn((fn) => fn),
    use: vi.fn(),
  },
}));

// Mock auth middleware
vi.mock("$middlewares/auth.middleware", () => ({
  isJohnOwolabiIdogun: vi.fn((req, res, next) => next()),
  isAuthenticated: vi.fn((req, res, next) => {
    if (req.headers["x-mock-authenticated"]) {
      req.user = { id: "123", name: "Test User" };
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  }),
  handleAuthError: vi.fn((err, req, res, next) => {
    if (err.name === "ProviderMismatchError") {
      res.status(401).json({
        success: false,
        message: err.message,
      });
      return;
    }
    next(err);
  }),
}));

// Mock passport with proper authentication handling
vi.mock("passport", () => {
  const authenticate = vi.fn((strategy: string, options: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
      // Store authentication call for verification
      (req as any).__authCall = { strategy, options };
      next();
    };
  });

  return {
    default: {
      authenticate,
      initialize: vi.fn(
        () => (req: Request, res: Response, next: NextFunction) => next()
      ),
      session: vi.fn(
        () => (req: Request, res: Response, next: NextFunction) => next()
      ),
      serializeUser: vi.fn(),
      deserializeUser: vi.fn(),
      use: vi.fn(),
    },
  };
});

describe("Auth Routes", () => {
  const AUTH_URL = `${BASE_URL}/auth`;
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Google Auth Routes", () => {
    it("should initiate Google OAuth flow", async () => {
      await request(app).get(`${AUTH_URL}/google`).expect(200);

      expect(passport.authenticate).toHaveBeenCalledWith("google", {
        scope: ["profile", "email"],
      });
    });

    it("should handle Google callback", async () => {
      await request(app).get(`${AUTH_URL}/google/callback`).expect(200);

      expect(passport.authenticate).toHaveBeenCalledWith("google", {
        failureRedirect: "/api/v1/auth/failure",
      });
    });
  });

  describe("GitHub Auth Routes", () => {
    it("should initiate GitHub OAuth flow without state", async () => {
      await request(app).get(`${AUTH_URL}/github`).expect(200);

      expect(passport.authenticate).toHaveBeenCalledWith("github", {
        scope: ["user:email"],
        state: "",
      });
    });

    it("should initiate GitHub OAuth flow with next URL", async () => {
      const nextUrl = "/dashboard";
      const expectedState = Buffer.from(nextUrl).toString("base64");

      await request(app)
        .get(`${AUTH_URL}/github`)
        .query({ next: nextUrl })
        .expect(200);

      expect(passport.authenticate).toHaveBeenCalledWith("github", {
        scope: ["user:email"],
        state: expectedState,
      });
    });

    it("should handle GitHub callback", async () => {
      await request(app).get(`${AUTH_URL}/github/callback`).expect(200);

      expect(passport.authenticate).toHaveBeenCalledWith("github", {
        failureRedirect: "/api/v1/auth/failure",
      });
    });
  });

  describe("Session Route", () => {
    it("should return user session when authenticated", async () => {
      const mockUser = { id: "123", name: "Test User" };

      await request(app)
        .get(`${AUTH_URL}/session`)
        .set("x-mock-authenticated", "true")
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({ user: mockUser });
        });
    });

    it("should reject unauthenticated session requests", async () => {
      await request(app)
        .get(`${AUTH_URL}/session`)
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({ message: "Unauthorized" });
        });
    });
  });

  describe("Auth Results Routes", () => {
    it("should handle login failure", async () => {
      await request(app).get(`${AUTH_URL}/failure`).expect(401);

      const controller = vi.mocked(AuthController).mock.results[0].value;
      expect(controller.handleLoginFailure).toHaveBeenCalled();
    });

    it("should handle logout", async () => {
      await request(app).get(`${AUTH_URL}/logout`).expect(200);

      const controller = vi.mocked(AuthController).mock.results[0].value;
      expect(controller.handleLogout).toHaveBeenCalled();
    });
  });
});
