const mongoose = require("mongoose")
const Voucher = require("./models/voucher")

// Connect to MongoDB and run debug only after connection is established
mongoose
  .connect("mongodb://localhost:27017/registration", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB successfully!")
    // Only run debug after connection is established
    await debugDatabase()
    // Close connection when done
    mongoose.connection.close()
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
    process.exit(1)
  })

async function debugDatabase() {
  try {
    console.log("\n=== DATABASE DEBUG INFO ===\n")

    // Check connection status
    const dbState = mongoose.connection.readyState
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    }
    console.log(`MongoDB connection status: ${states[dbState]} (${dbState})`)

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log("\nCollections in database:")
    collections.forEach((coll) => {
      console.log(`- ${coll.name}`)
    })

    // Check if vouchers collection exists
    const vouchersCollExists = collections.some((coll) => coll.name === "vouchers")
    console.log(`\nVouchers collection exists: ${vouchersCollExists}`)

    // Try to count documents in the vouchers collection
    try {
      const count = await Voucher.countDocuments()
      console.log(`Vouchers count: ${count}`)

      if (count > 0) {
        // Get a sample voucher
        const sampleVoucher = await Voucher.findOne()
        console.log("\nSample voucher:")
        console.log(JSON.stringify(sampleVoucher, null, 2))
      } else {
        console.log("No vouchers found in the database.")
      }
    } catch (err) {
      console.error("Error counting vouchers:", err.message)
    }

    // Check model configuration
    console.log("\nVoucher model configuration:")
    console.log(`- Model name: ${Voucher.modelName}`)
    console.log(`- Collection name: ${Voucher.collection.name}`)
    console.log(`- Schema paths: ${Object.keys(Voucher.schema.paths).join(", ")}`)

    console.log("\n=== END DEBUG INFO ===\n")
  } catch (error) {
    console.error("Debug error:", error)
  }
}

// We don't call debugDatabase() here anymore - it's called after connection is established