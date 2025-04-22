const jwt = require("jsonwebtoken")
const fs = require("fs")
require("dotenv").config()

// Function to check if a token is valid
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key_here")
    return {
      valid: true,
      decoded,
    }
  } catch (error) {
    return {
      valid: false,
      error: error.message,
    }
  }
}

// Get token from command line argument
const token = process.argv[2]

if (!token) {
  console.log("Please provide a token as a command line argument")
  console.log("Example: node check-auth.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
  process.exit(1)
}

// Verify the token
const result = verifyToken(token)

if (result.valid) {
  console.log("Token is valid!")
  console.log("Decoded token:", result.decoded)

  // Check if user exists in database
  const mongoose = require("mongoose")
  const User = require("./models/user")

  mongoose
    .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/registration")
    .then(async () => {
      console.log("Connected to MongoDB")

      try {
        const user = await User.findById(result.decoded.id)

        if (user) {
          console.log("User found in database:")
          console.log({
            id: user._id,
            username: user.username,
            email: user.email,
            points: user.points,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          })
        } else {
          console.log("User not found in database!")
          console.log("Token contains user ID:", result.decoded.id)
        }

        mongoose.connection.close()
      } catch (error) {
        console.error("Error finding user:", error)
        mongoose.connection.close()
      }
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err)
    })
} else {
  console.log("Token is invalid!")
  console.log("Error:", result.error)
}
