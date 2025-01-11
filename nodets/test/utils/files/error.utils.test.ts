import { sendAuthError } from "$utils/error.utils.ts";
import { AuthError, AuthErrorType } from "$types/error.types.ts";
import { baseConfig } from "$config/base.config.ts";

// error.utils.test.ts
describe("Sample Test error.utils.test.ts", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});

describe("sendAuthError", () => {
  let mockResponse: any;
  let mockRequest: any;

  beforeEach(() => {
    mockRequest = {
      xhr: false,
      headers: { accept: "" },
    };
    mockResponse = {
      req: mockRequest,
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn(),
    };
  });

  it("should return JSON if isApi is true", () => {
    mockRequest.xhr = true;
    const error: AuthError = {
      name: "Unauthorized",
      statusCode: 401,
      type: AuthErrorType.UNAUTHORIZED,
      message: "Test Error",
      provider: "TestProvider",
    };
    sendAuthError(mockResponse, error);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      type: "UNAUTHORIZED",
      message: "Test Error",
      provider: "TestProvider",
    });
  });

  it("should redirect if isApi is false", () => {
    const error: AuthError = {
      name: "Unauthorized",
      statusCode: 401,
      type: AuthErrorType.UNAUTHORIZED,
      message: "Test Error",
      provider: "TestProvider",
    };
    sendAuthError(mockResponse, error);
    const query = new URLSearchParams({
      error: "Test Error",
      provider: "TestProvider",
    });
    expect(mockResponse.redirect).toHaveBeenCalledWith(
      `${baseConfig.frontendUrl}/auth/login?${query}`
    );
  });
});
