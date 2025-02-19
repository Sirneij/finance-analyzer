import { config } from "dotenv";
import { startInMemoryMongo, stopInMemoryMongo } from "./setupMongo";
import { afterAll, beforeAll } from "vitest";
import { baseConfig } from "$config/base.config";

// Load the test environment variables from .env.test
config({ path: ".env.test" });

export const BASE_URL = `/api/v1`;

beforeAll(async () => {
  // Ensure clean state before starting
  await stopInMemoryMongo();
  // Start the in-memory MongoDB
  await startInMemoryMongo();
  // Update config after connection is established
  baseConfig.db.uri = process.env.DB_URI;
});

afterAll(async () => {
  await stopInMemoryMongo();
});
