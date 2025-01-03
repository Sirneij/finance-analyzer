import { AuthConfig } from "$types/auth.types.ts";
import { DbConfig } from "$types/db.types.ts";
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
}
