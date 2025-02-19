import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { requestLogger } from "$middlewares/logger.middleware";
import { baseConfig } from "$config/base.config.js";

function createMockReqRes() {
  const req: Partial<Request> = {
    method: "GET",
    originalUrl: "/test",
  };

  const res: Partial<Response> = {
    statusCode: 200,
    on: vi.fn(),
  };

  const next: NextFunction = vi.fn();

  return { req: req as Request, res: res as Response, next };
}

describe("Logger Middleware", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    // Mock logger.info
    vi.spyOn(baseConfig.logger, "info").mockReturnValue(baseConfig.logger);
  });

  it("should call next middleware", () => {
    const { req, res, next } = createMockReqRes();

    requestLogger(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should log request details on finish", () => {
    const { req, res, next } = createMockReqRes();
    let finishCallback: () => void;

    // Capture the finish callback
    (res.on as any).mockImplementation(
      (event: string, callback: () => void) => {
        if (event === "finish") {
          finishCallback = callback;
        }
      }
    );

    // Start time
    const now = new Date(2024, 1, 1, 12, 0, 0);
    vi.setSystemTime(now);

    requestLogger(req, res, next);

    // Advance time by 100ms
    vi.advanceTimersByTime(100);

    // Simulate response finish
    finishCallback!();

    expect(baseConfig.logger.info).toHaveBeenCalledWith("GET /test 200 100ms");
  });

  it("should handle different HTTP methods and status codes", () => {
    const { req, res, next } = createMockReqRes();
    let finishCallback: () => void;

    // Setup POST request with 201 status
    req.method = "POST";
    req.originalUrl = "/api/users";
    res.statusCode = 201;

    // Capture the finish callback
    (res.on as any).mockImplementation(
      (event: string, callback: () => void) => {
        if (event === "finish") {
          finishCallback = callback;
        }
      }
    );

    // Start time
    const now = new Date(2024, 1, 1, 12, 0, 0);
    vi.setSystemTime(now);

    requestLogger(req, res, next);

    // Advance time by 150ms
    vi.advanceTimersByTime(150);

    // Simulate response finish
    finishCallback!();

    expect(baseConfig.logger.info).toHaveBeenCalledWith(
      "POST /api/users 201 150ms"
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});
