import { BaseConfig } from "$types/misc.types.ts";
import { authConfig } from "$config/internal/auth.config.ts";
import { dbConfig } from "$config/internal/db.config.ts";
import { logger } from "$config/internal/logger.config.ts";

// export const baseConfig: BaseConfig = {
//   auth: authConfig,
//   db: dbConfig,
//   frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
//   logger: logger,
//   utility_service_url:
//     process.env.UTILITY_SERVICE_URL || "http://localhost:5173",

//   redis_url: process.env.REDIS_URL || "redis://localhost:6379",
// };
export const baseConfig: BaseConfig = {
  get frontendUrl() {
    return process.env.FRONTEND_URL || "http://localhost:3000";
  },
  get utility_service_url() {
    return process.env.UTILITY_SERVICE_URL || "http://localhost:5173";
  },
  get redis_url() {
    return process.env.REDIS_URL || "redis://localhost:6379";
  },
  auth: authConfig,
  db: dbConfig,
  logger: logger,
};
