// pages/api/cart.js
import { authMiddleware } from "../auth-middleware"
import { MongoClient } from "mongodb"

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "registration" // Your database name

/**
 * API endpoint to handle cart operations
 */
export default async function handler(req, res) {
  // Apply auth middleware
  await new Promise((resolve) => {
    authMiddleware(req, res, resolve)
  })

  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  // Get user ID from the authenticated user
  const userId = req.user.id || req.user._id.toString()

  // Connect to MongoDB
  let client
  try {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db(DB_NAME)
    const cartsCollection = db.collection("carts")

    // Handle different HTTP methods
    if (req.method === "GET") {
      // Get user's cart
      const cart = await cartsCollection.findOne({ userId })
      return res.status(200).json({
        items: cart ? cart.items : [],
        success: true,
      })
    } else if (req.method === "POST") {
      // Update user's cart
      const { items } = req.body
      
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "Items must be an array", success: false })
      }

      // Update or insert cart
      const result = await cartsCollection.updateOne(
        { userId },
        {
          $set: {
            items,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      )

      return res.status(200).json({
        success: true,
        updated: result.modifiedCount > 0,
        created: result.upsertedCount > 0,
      })
    } else if (req.method === "DELETE") {
      // Clear user's cart
      const result = await cartsCollection.deleteOne({ userId })
      return res.status(200).json({
        success: true,
        deleted: result.deletedCount > 0,
      })
    } else {
      return res.status(405).json({ error: "Method not allowed", success: false })
    }
  } catch (error) {
    console.error("Cart operation error:", error)
    return res.status(500).json({ error: "Internal server error", success: false })
  } finally {
    if (client) await client.close()
  }
}