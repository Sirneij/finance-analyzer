import { AuthConfig } from "$types/auth.types.js";
import { DbConfig } from "$types/db.types.js";
import winston from "winston";

export enum Providers {
  GOOGLE = 1,
  GITHUB = 2,
}

export interface BaseConfig {
  auth: AuthConfig;
  db: DbConfig;
  frontendUrl: string;
  logger: winston.Logger;
  utility_service_url: string;
  redis_url: string;
}
