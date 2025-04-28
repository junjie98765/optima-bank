// Simple test script for MongoDB cart operations
const { MongoClient } = require("mongodb")

// Connection URL
const url = "mongodb://localhost:27017"
const client = new MongoClient(url)

// Database Name
const dbName = "registration"

async function testCartOperations() {
  try {
    // Connect to MongoDB
    await client.connect()
    console.log("Connected to MongoDB server")

    const db = client.db(dbName)
    const cartsCollection = db.collection("carts")

    // Generate a test user ID
    const testUserId = "test-user-" + Date.now()
    console.log(`Testing with user ID: ${testUserId}`)

    // 1. Create a test cart
    console.log("\n1. Creating test cart...")
    const testCart = {
      userId: testUserId,
      items: [
        {
          id: "test-voucher-1",
          name: "Test Voucher 1",
          points: 100,
          quantity: 1,
          description: "Test description 1",
          validity: "2023-12-31",
        },
        {
          id: "test-voucher-2",
          name: "Test Voucher 2",
          points: 200,
          quantity: 2,
          description: "Test description 2",
          validity: "2023-12-31",
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const insertResult = await cartsCollection.insertOne(testCart)
    console.log("Cart created with ID:", insertResult.insertedId)

    // 2. Retrieve the cart
    console.log("\n2. Retrieving cart...")
    const foundCart = await cartsCollection.findOne({ userId: testUserId })
    console.log("Found cart:", foundCart)

    // 3. Update the cart
    console.log("\n3. Updating cart...")
    const updateResult = await cartsCollection.updateOne(
      { userId: testUserId },
      {
        $push: {
          items: {
            id: "test-voucher-3",
            name: "Test Voucher 3",
            points: 300,
            quantity: 3,
            description: "Test description 3",
            validity: "2023-12-31",
          },
        },
        $set: { updatedAt: new Date() },
      },
    )
    console.log("Update result:", updateResult.modifiedCount > 0 ? "Success" : "Failed")

    // 4. Retrieve the updated cart
    console.log("\n4. Retrieving updated cart...")
    const updatedCart = await cartsCollection.findOne({ userId: testUserId })
    console.log("Updated cart:", updatedCart)

    // 5. Delete the cart
    console.log("\n5. Deleting cart...")
    const deleteResult = await cartsCollection.deleteOne({ userId: testUserId })
    console.log("Delete result:", deleteResult.deletedCount > 0 ? "Success" : "Failed")

    // 6. Verify deletion
    console.log("\n6. Verifying deletion...")
    const deletedCart = await cartsCollection.findOne({ userId: testUserId })
    console.log("Cart after deletion:", deletedCart)

    console.log("\nAll tests completed successfully!")
  } catch (error) {
    console.error("Test failed:", error)
  } finally {
    await client.close()
    console.log("MongoDB connection closed")
  }
}

// Run the tests
testCartOperations()
