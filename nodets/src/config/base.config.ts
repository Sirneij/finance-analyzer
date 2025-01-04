import { BaseConfig } from "$types/misc.types.ts";
import { authConfig } from "$config/internal/auth.config.ts";
import { dbConfig } from "$config/internal/db.config.ts";
import { logger } from "$config/internal/logger.config.ts";

export const baseConfig: BaseConfig = {
  auth: authConfig,
  db: dbConfig,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  logger: logger,
  utility_service_url:
    process.env.UTILITY_SERVICE_URL || "http://localhost:5173",
};
