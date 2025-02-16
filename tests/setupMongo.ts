import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer;

export const startInMemoryMongo = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  // Override the DB_URI environment variable if your app uses it
  process.env.DB_URI = uri;
  // Connect Mongoose using the in-memory URI (if your app uses mongoose)
  await mongoose.connect(uri);
  console.log("In-memory MongoDB started");
};

export const stopInMemoryMongo = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
    console.log("In-memory MongoDB stopped");
  }
};
