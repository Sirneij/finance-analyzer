import mongoose from "mongoose";
import { createClient } from "redis";
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";
import mockRedis from "redis-mock";

// Load environment variables for testing
dotenv.config({ path: ".env.test" });

// Mock Redis client
jest.mock("redis", () => {
  return {
    createClient: jest.fn(() => mockRedis.createClient()),
  };
});

// Set up MongoDB in-memory database for testing
beforeAll(async () => {
  const mongoServer = await MongoMemoryServer.create();
  process.env.DB_URI = mongoServer.getUri();

  await mongoose.connect(process.env.DB_URI, {
    dbName: "test",
  });

  // Ensure connection is ready
  await mongoose.connection.asPromise();
});

// Clear the database between tests
afterEach(async () => {
  if (!mongoose.connection.db) {
    throw new Error("Database connection not established");
  }

  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// Close connections after tests
afterAll(async () => {
  await mongoose.connection.close();

  // If you're using redis-mock, no need to explicitly close
  const redisClient = createClient();
  await redisClient.quit();
});
