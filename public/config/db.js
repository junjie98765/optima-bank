const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    // Add more detailed logging for troubleshooting
    console.log("Attempting to connect to MongoDB...")
    console.log(`Connection string: ${process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@")}`) // Log connection string with hidden credentials

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log(`MongoDB Connected: ${conn.connection.host}`)
    return true
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`)
    console.error(error)
    return false
  }
}

module.exports = connectDB
