import { baseConfig } from "$config/base.config.js";

describe("baseConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Clone original environment variables to avoid side effects
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe("frontendUrl", () => {
    it("should use default frontend URL when environment variable is not set", () => {
      delete process.env.FRONTEND_URL;
      expect(baseConfig.frontendUrl).toBe("http://localhost:3000");
    });

    it("should use environment frontend URL when set", () => {
      process.env.FRONTEND_URL = "https://example.com";
      expect(baseConfig.frontendUrl).toBe("https://example.com");
    });
  });

  describe("utilityServiceUrl", () => {
    it("should use default utility service URL when environment variable is not set", () => {
      delete process.env.UTILITY_SERVICE_URL;
      expect(baseConfig.utilityServiceUrl).toBe("http://localhost:5173");
    });

    it("should use environment utility service URL when set", () => {
      process.env.UTILITY_SERVICE_URL = "https://utility.example.com";
      expect(baseConfig.utilityServiceUrl).toBe("https://utility.example.com");
    });
  });

  describe("redisUrl", () => {
    it("should use default Redis URL when environment variable is not set", () => {
      delete process.env.REDIS_URL;
      expect(baseConfig.redisUrl).toBe("redis://localhost:6379");
    });

    it("should use environment Redis URL when set", () => {
      process.env.REDIS_URL = "redis://redis.example.com:6379";
      expect(baseConfig.redisUrl).toBe("redis://redis.example.com:6379");
    });
  });

  describe("auth configuration", () => {
    it("should include auth configuration", () => {
      expect(baseConfig.auth).toBeDefined();
    });
  });

  describe("database configuration", () => {
    it("should include database configuration", () => {
      expect(baseConfig.db).toBeDefined();
    });
  });

  describe("logger configuration", () => {
    it("should include logger configuration", () => {
      expect(baseConfig.logger).toBeDefined();
    });
  });
});
