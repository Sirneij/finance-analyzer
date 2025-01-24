import { BaseConfig } from "$types/misc.types.js";
import { authConfig } from "$config/internal/auth.config.js";
import { dbConfig } from "$config/internal/db.config.js";
import { logger } from "$config/internal/logger.config.js";

export const baseConfig: BaseConfig = {
  get frontendUrl() {
    return process.env.FRONTEND_URL || "http://localhost:3000";
  },
  get utilityServiceUrl() {
    return process.env.UTILITY_SERVICE_URL || "http://localhost:5173";
  },
  get redisUrl() {
    return process.env.REDIS_URL || "redis://localhost:6379";
  },
  get cookieDomain() {
    return process.env.COOKIE_DOMAIN || "localhost";
  },
  get cloudinaryURL() {
    return process.env.CLOUDINARY_URL || "";
  },
  auth: authConfig,
  db: dbConfig,
  logger: logger,
};
