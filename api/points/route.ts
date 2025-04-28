import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"

// Replace with your actual MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "registration"

export async function GET() {
  let client

  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI)
    await client.connect()

    const db = client.db(DB_NAME)
    const usersCollection = db.collection("users")

    // In a real app, you would get the user ID from the session
    // For now, we'll use a hardcoded user ID for demonstration
    const userId = "current-user-id"

    // Find the user in the database
    const user = await usersCollection.findOne({ userId })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return the user's points
    return NextResponse.json({ points: user.points })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch points from database" }, { status: 500 })
  } finally {
    // Close the connection
    if (client) await client.close()
  }
}
