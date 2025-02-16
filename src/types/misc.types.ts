import type { AuthConfig } from "$types/auth.types.js";
import type { DbConfig } from "$types/db.types.js";
import winston from "winston";

export enum Providers {
  GOOGLE = 1,
  GITHUB = 2,
}

export interface BaseConfig {
  auth: AuthConfig;
  db: DbConfig;
  frontendUrl: string | undefined;
  logger: winston.Logger;
  utilityServiceUrl: string | undefined;
  redisUrl: string | undefined;
  cookieDomain: string | undefined;
  cloudinaryURL: string | undefined;
}
