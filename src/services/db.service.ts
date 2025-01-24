import mongoose from "mongoose";
import { baseConfig } from "$config/base.config.js";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";
import { v2 as cloudinary } from "cloudinary";

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
    url: baseConfig.redisUrl,
  });

  redisClient.connect().catch((error) => {
    baseConfig.logger.error("❌ Redis connection error:", error);
  });

  redisClient.on("connect", () => {
    baseConfig.logger.info("✅ Redis connection successful");
  });

  return new RedisStore({ client: redisClient, prefix: "session:" });
};

export class CloudinaryService {
  private static instance: CloudinaryService;
  private cloudinaryInstance: typeof cloudinary;

  private constructor() {
    this.cloudinaryInstance = cloudinary;
    this.cloudinaryInstance.config({
      secure: process.env.NODE_ENV === "production",
    });
  }

  public static getInstance(): CloudinaryService {
    if (!CloudinaryService.instance) {
      CloudinaryService.instance = new CloudinaryService();
    }
    return CloudinaryService.instance;
  }

  public getCloudinary(): typeof cloudinary {
    return this.cloudinaryInstance;
  }
}

export const cloudinaryService = CloudinaryService.getInstance();
