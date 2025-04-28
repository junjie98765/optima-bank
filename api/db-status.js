// API route to check database connection status
import { MongoClient } from "mongodb"

// MongoDB connection string
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  let client = null

  try {
    console.log("Testing MongoDB connection...")
    console.log(
      "Connection string (masked):",
      uri.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, "mongodb$1://$2:****@"),
    )

    // Try to connect to MongoDB
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    })

    await client.connect()

    // Ping the database to check connection
    await client.db("admin").command({ ping: 1 })

    console.log("MongoDB connection test successful")

    return res.status(200).json({
      connected: true,
      message: "Successfully connected to MongoDB",
    })
  } catch (error) {
    console.error("MongoDB connection test failed:", error)

    return res.status(200).json({
      connected: false,
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  } finally {
    if (client) {
      await client.close()
    }
  }
}
