import mongoose from "mongoose";
import { baseConfig } from "$config/base.config.ts";

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
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.once("open", () => {
      console.log("✅ Connected to MongoDB");
    });

    return mongoose.connection;
  } catch (error) {
    console.error(
      `❌ MongoDB connection attempt ${retryCount + 1} failed:`,
      error
    );

    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      return connectToCluster(retryCount + 1);
    }

    throw error;
  }
}
