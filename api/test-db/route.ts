import { MongoClient } from "mongodb"

// Replace with your actual MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "registration" // Using your existing database

export async function GET(req, res) {
  let client

  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(DB_NAME)

    // List all collections
    const collections = await db.listCollections().toArray()
    console.log(
      "Collections:",
      collections.map((c) => c.name),
    )

    // Create a test document in carts collection
    const cartsCollection = db.collection("carts")
    const testCart = {
      userId: "test-user-" + Date.now(),
      items: [
        {
          id: "test-voucher",
          name: "Test Voucher",
          points: 100,
          quantity: 1,
          description: "Test description",
          validity: "2023-12-31",
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await cartsCollection.insertOne(testCart)

    res.status(200).json({
      success: true,
      message: "Database connection successful",
      insertedId: result.insertedId,
      collections: collections.map((c) => c.name),
    })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({
      error: "Database connection failed",
      details: error instanceof Error ? error.message : String(error),
    })
  } finally {
    // Close the connection
    if (client) await client.close()
  }
}
