const { MongoClient } = require("mongodb")

// Connection URL
const url = "mongodb://localhost:27017"
const client = new MongoClient(url)

// Database Name
const dbName = "registration"

async function main() {
  // Use connect method to connect to the server
  await client.connect()
  console.log("Connected successfully to MongoDB server")

  const db = client.db(dbName)

  // List collections
  const collections = await db.listCollections().toArray()
  console.log(
    "Collections:",
    collections.map((c) => c.name),
  )

  // Insert a test document
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
  console.log("Inserted document:", result.insertedId)

  // Find the document we just inserted
  const foundCart = await cartsCollection.findOne({ userId: testCart.userId })
  console.log("Found cart:", foundCart)

  return "done"
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close())
