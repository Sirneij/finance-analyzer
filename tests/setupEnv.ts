import { config } from "dotenv";
import { startInMemoryMongo, stopInMemoryMongo } from "./setupMongo";
import { afterAll, beforeAll } from "vitest";
import { baseConfig } from "$config/base.config";

// Load the test environment variables from .env.test
const result = config({ path: ".env.test" });
console.log("Loaded env file:", result.parsed);

beforeAll(async () => {
  // Start the in-memory MongoDB
  await startInMemoryMongo();
  // Ensure that the connection string used in tests is the in-memory URI
  baseConfig.db.uri = process.env.DB_URI;
});

afterAll(async () => {
  await stopInMemoryMongo();
});
