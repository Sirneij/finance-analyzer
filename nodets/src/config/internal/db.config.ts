import { DbConfig } from "$types/db.types.ts";

import { config } from "dotenv";

config();

export const dbConfig: DbConfig = {
  uri: process.env.DB_URI || "mongodb://localhost:27017",
  dbName: process.env.DB_NAME || "test",
};
