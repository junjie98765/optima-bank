import { MongoClient } from "mongodb"

// Connection URI
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const dbName = "registration"

let cachedClient: MongoClient | null = null
let cachedDb: any = null

export async function connectToDatabase() {
  // If we already have a connection, use it
  if (cachedDb) {
    return cachedDb
  }

  // If no connection, create a new one
  if (!cachedClient) {
    cachedClient = new MongoClient(uri)
    await cachedClient.connect()
  }

  const db = cachedClient.db(dbName)
  cachedDb = db
  return db
}
