import { config } from "dotenv";
import { startInMemoryMongo, stopInMemoryMongo } from "./setupMongo";
import { afterAll, beforeAll } from "vitest";
import { baseConfig } from "$config/base.config";

// Load the test environment variables from .env.test
config({ path: [".env.test"] });

beforeAll(async () => {
  // Start the in-memory MongoDB
  await startInMemoryMongo();
  // Ensure that the connection string used in tests is the in-memory URI
  baseConfig.db.uri = process.env.DB_URI;
});

afterAll(async () => {
  await stopInMemoryMongo();
});
