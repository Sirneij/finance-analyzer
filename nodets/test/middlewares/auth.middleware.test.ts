import {
  isAuthenticated,
  handleAuthError,
} from "$middlewares/auth.middleware.ts";
import { ProviderMismatchError } from "$types/error.types.ts";
import { Request, Response } from "express";

// auth.middleware.test.ts
describe("Sample Test auth.middleware.test.ts", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});
// auth.middleware.test.ts

describe("isAuthenticated Middleware", () => {
  it("should call next if user is authenticated", () => {
    const req = {
      isAuthenticated: jest.fn().mockReturnValue(true),
    } as unknown as Request;
    const res = {} as Response;
    const next = jest.fn();

    isAuthenticated(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should return 401 if user is not authenticated", () => {
    const req = {
      isAuthenticated: jest.fn().mockReturnValue(false),
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    isAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });
});

describe("handleAuthError Middleware", () => {
  let mockReq: Partial<Request> & { xhr?: boolean };
  let mockResponse: Partial<Response>;
  beforeEach(() => {
    mockReq = {
      xhr: false,
      headers: { accept: "" },
    } as Partial<Request>;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn(),
      req: mockReq as Request,
    } as Partial<Response>;
  });

  it("should handle ProviderMismatchError", () => {
    mockReq.xhr = true;
    const err = new ProviderMismatchError("someProvider");
    const next = jest.fn();

    handleAuthError(err, mockReq as Request, mockResponse as Response, next);

    // Validate that status and json were called
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      type: "PROVIDER_MISMATCH",
      message: "Please login with someProvider",
      provider: "someProvider",
    });
  });

  it("should call next for other errors", () => {
    const err = new Error("Some other error");
    const next = jest.fn();

    handleAuthError(err, mockReq as Request, mockResponse as Response, next);

    expect(next).toHaveBeenCalledWith(err);
  });
});
