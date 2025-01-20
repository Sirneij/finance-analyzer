import mongoose from "mongoose";
import { baseConfig } from "$config/base.config.js";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000;

export async function connectToCluster(retryCount = 0) {
  try {
    await mongoose.connect(baseConfig.db.uri, {
      dbName: baseConfig.db.dbName,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });

    mongoose.connection.on("error", (err) => {
      baseConfig.logger.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.once("open", () => {
      baseConfig.logger.info("✅ MongoDB connection successful");
    });

    return mongoose.connection;
  } catch (error) {
    baseConfig.logger.error("❌ MongoDB connection error:", error);

    if (retryCount < MAX_RETRIES) {
      baseConfig.logger.info(
        `Retrying connection to MongoDB cluster in ${
          RETRY_INTERVAL / 1000
        } seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      return connectToCluster(retryCount + 1);
    }

    throw error;
  }
}

export const connectToRedis = (): RedisStore => {
  const redisClient = createClient({
    url: baseConfig.redis_url,
  });

  redisClient.connect().catch((error) => {
    baseConfig.logger.error("❌ Redis connection error:", error);
  });

  redisClient.on("connect", () => {
    baseConfig.logger.info("✅ Redis connection successful");
  });

  return new RedisStore({ client: redisClient, prefix: "session:" });
};
