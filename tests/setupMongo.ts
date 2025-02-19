import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer;

export const startInMemoryMongo = async () => {
  if (mongoose.connection.readyState === 1) {
    // If already connected, close existing connection
    await mongoose.disconnect();
  }

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.DB_URI = uri;

  // Configure mongoose to use new connection
  await mongoose.connect(uri, {
    autoCreate: true,
    autoIndex: true,
  });

  console.log("In-memory MongoDB started");
};

export const stopInMemoryMongo = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    if (mongoServer) {
      await mongoServer.stop();
      console.log("In-memory MongoDB stopped");
    }
  } catch (error) {
    console.error("Error stopping MongoDB:", error);
  }
};

export const clearDatabase = async () => {
  if (mongoose.connection.readyState !== 1) {
    console.log("No active connection to clear");
    return;
  }

  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    console.log("Database cleared");
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
};
