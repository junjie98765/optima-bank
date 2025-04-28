// MongoDB connection utility
// Place this file in your lib directory if it doesn't already exist

import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const MONGODB_DB = process.env.MONGODB_DB || "registration"

// Check if we have a connection to the database cached
let cachedClient = null
let cachedDb = null

export async function connectToDatabase() {
  // If we have a cached connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  // If no cached connection, create a new one
  const client = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  await client.connect()
  const db = client.db(MONGODB_DB)

  // Cache the client and db connection
  cachedClient = client
  cachedDb = db

  return { client, db }
}
