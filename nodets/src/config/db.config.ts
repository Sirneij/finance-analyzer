import { config } from "dotenv";
import { DbConfig } from "$types/db.types.ts";

config();

export const dbConfig: DbConfig = {
  uri: process.env.DB_URI || "mongodb://localhost:27017",
  dbName: process.env.DB_NAME || "test",
};
