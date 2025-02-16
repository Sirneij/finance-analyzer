import { MongoClient, Db } from "mongodb";

export interface DbConfig {
  uri: string | undefined;
  dbName: string | undefined;
}

export interface DatabaseConnection {
  client: MongoClient | null;
  db: Db | null;
}
