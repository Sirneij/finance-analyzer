import { AuthConfig } from "$types/auth.types.ts";
import { DbConfig } from "$types/db.types.ts";

export enum Providers {
  GOOGLE,
  GITHUB,
}

export interface BaseConfig {
  auth: AuthConfig;
  db: DbConfig;
  frontendUrl: string;
}
