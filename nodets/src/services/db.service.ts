import { MongoClient } from "mongodb";
import { dbConfig } from "$config/db.config.ts";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

function validateMongoUri(uri: string): boolean {
  const mongoUrlPattern = /^mongodb(\+srv)?:\/\/.+/;
  return mongoUrlPattern.test(uri);
}

async function retryConnection(
  uri: string,
  attempt: number = 1
): Promise<MongoClient> {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    return client;
  } catch (error) {
    if (attempt >= MAX_RETRIES) throw error;
    console.log(`Retry attempt ${attempt} of ${MAX_RETRIES}`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    return retryConnection(uri, attempt + 1);
  }
}

export async function connectToCluster(uri: string = dbConfig.uri) {
  let mongoClient: MongoClient | null = null;

  if (!validateMongoUri(uri)) {
    throw new Error("Invalid MongoDB connection string");
  }

  try {
    console.log("Connecting to MongoDB Atlas cluster...");
    mongoClient = await retryConnection(uri);
    console.log("Successfully connected to MongoDB Atlas!");
    return mongoClient;
  } catch (error) {
    console.error("Connection to MongoDB Atlas failed!", error);
    throw error;
  }
}
