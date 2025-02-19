import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { baseConfig } from "$config/base.config";
import { authConfig } from "$config/internal/auth.config";
import { dbConfig } from "$config/internal/db.config";
import { logger } from "$config/internal/logger.config";

describe.concurrent("baseConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Create a fresh copy of process.env for each test
    process.env = {};
  });

  afterEach(() => {
    // Restore original process.env after each test
    process.env = originalEnv;
  });

  describe("environment variable getters", () => {
    it("should return frontendUrl from environment", () => {
      process.env.FRONTEND_URL = "http://test-frontend.com";
      expect(baseConfig.frontendUrl).toBe("http://test-frontend.com");
    });

    it("should return utilityServiceUrl from environment", () => {
      process.env.UTILITY_SERVICE_URL = "http://test-utility.com";
      expect(baseConfig.utilityServiceUrl).toBe("http://test-utility.com");
    });

    it("should return redisUrl from environment", () => {
      process.env.REDIS_URL = "redis://test-redis:6379";
      expect(baseConfig.redisUrl).toBe("redis://test-redis:6379");
    });

    it("should return cookieDomain from environment", () => {
      process.env.COOKIE_DOMAIN = "test-domain.com";
      expect(baseConfig.cookieDomain).toBe("test-domain.com");
    });

    it("should return cloudinaryURL from environment", () => {
      process.env.CLOUDINARY_URL = "https://test-cloudinary.com";
      expect(baseConfig.cloudinaryURL).toBe("https://test-cloudinary.com");
    });

    it("should return undefined when environment variables are not set", () => {
      expect(baseConfig.frontendUrl).toBeUndefined();
      expect(baseConfig.utilityServiceUrl).toBeUndefined();
      expect(baseConfig.redisUrl).toBeUndefined();
      expect(baseConfig.cookieDomain).toBeUndefined();
      expect(baseConfig.cloudinaryURL).toBeUndefined();
    });
  });

  describe("config object properties", () => {
    it("should have correct auth config", () => {
      expect(baseConfig.auth).toBe(authConfig);
    });

    it("should have correct db config", () => {
      expect(baseConfig.db).toBe(dbConfig);
    });

    it("should have correct logger config", () => {
      expect(baseConfig.logger).toBe(logger);
    });
    it("should have correct logger config", () => {
      expect(baseConfig.logger).toBe(logger);
    });
    it("should handle logger in development", async () => {
      // Store original NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;

      // Reset module imports to trigger logger recreation
      vi.resetModules();

      // Set environment before importing logger
      process.env.NODE_ENV = "development";

      // Re-import logger using dynamic import
      const { logger } = await import("$config/internal/logger.config");

      expect(logger.level).toBe("debug");

      // Restore original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });
  });
});
