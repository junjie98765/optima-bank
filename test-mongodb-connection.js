// This is a test script to verify MongoDB connection and operations
// You can run this directly on your server to test the connection

import { MongoClient, ObjectId } from "mongodb"

async function testMongoDBConnection() {
  console.log("Testing MongoDB connection...")

  // Get environment variables
  const MONGODB_URI = process.env.MONGODB_URI
  const MONGODB_DB = process.env.MONGODB_DB

  console.log("MongoDB Database:", MONGODB_DB)
  console.log("MongoDB URI set:", MONGODB_URI ? "Yes" : "No")

  if (!MONGODB_URI || !MONGODB_DB) {
    console.error("Missing environment variables!")
    return
  }

  let client = null

  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...")
    client = await MongoClient.connect(MONGODB_URI)
    console.log("Connected successfully to MongoDB server")

    // Get database
    const db = client.db(MONGODB_DB)
    console.log("Using database:", MONGODB_DB)

    // List collections
    console.log("Listing collections...")
    const collections = await db.listCollections().toArray()
    console.log(
      "Collections:",
      collections.map((c) => c.name),
    )

    // Check if users collection exists
    if (collections.some((c) => c.name === "users")) {
      console.log("Users collection exists")

      // Find a user
      const userId = "68075031fbb48bb3eb90b54e" // Replace with your user ID
      console.log("Looking for user with ID:", userId)

      try {
        const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
        if (user) {
          console.log("User found:", {
            id: user._id.toString(),
            username: user.username,
            points: user.points,
          })

          // Test update operation
          console.log("Testing update operation (will be rolled back)...")
          const originalPoints = user.points
          const testPoints = originalPoints - 1

          const updateResult = await db
            .collection("users")
            .updateOne({ _id: new ObjectId(userId) }, { $set: { points: testPoints } })

          console.log("Update result:", {
            matchedCount: updateResult.matchedCount,
            modifiedCount: updateResult.modifiedCount,
            acknowledged: updateResult.acknowledged,
          })

          // Verify the update
          const updatedUser = await db.collection("users").findOne({ _id: new ObjectId(userId) })
          console.log("Updated user points:", updatedUser.points)

          // Roll back the change
          await db.collection("users").updateOne({ _id: new ObjectId(userId) }, { $set: { points: originalPoints } })

          console.log("Points rolled back to original value:", originalPoints)
        } else {
          console.log("User not found with ID:", userId)
        }
      } catch (error) {
        console.error("Error finding/updating user:", error.message)
      }
    } else {
      console.log("Users collection does not exist!")
    }
  } catch (error) {
    console.error("MongoDB connection error:", error)
  } finally {
    // Close the connection
    if (client) {
      console.log("Closing MongoDB connection...")
      await client.close()
      console.log("MongoDB connection closed")
    }
  }
}

// Run the test
testMongoDBConnection()
