import { MongoClient, Db } from "mongodb";

export interface DbConfig {
  uri: string;
  dbName: string;
}

export interface DatabaseConnection {
  client: MongoClient | null;
  db: Db | null;
}
