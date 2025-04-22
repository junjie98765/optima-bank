// This script checks if the JWT token is valid and contains the correct user ID
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
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
  console.log("Example: node check-token.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
  process.exit(1)
}

// Verify the token
const result = verifyToken(token)

if (result.valid) {
  console.log("✅ Token is valid!")
  console.log("Decoded token:", result.decoded)

  // Connect to MongoDB and check if user exists
  mongoose
    .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/registration")
    .then(async () => {
      console.log("Connected to MongoDB")

      try {
        // Get User model
        const User = mongoose.model("User")

        // Find user by ID
        const user = await User.findById(result.decoded.id)

        if (user) {
          console.log("✅ User found in database:")
          console.log({
            id: user._id,
            username: user.username,
            email: user.email,
            points: user.points,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          })
        } else {
          console.log("❌ User not found in database!")
          console.log("Token contains user ID:", result.decoded.id)

          // Try to find user by username
          if (result.decoded.username) {
            const userByUsername = await User.findOne({ username: result.decoded.username })
            if (userByUsername) {
              console.log("✅ User found by username:")
              console.log({
                id: userByUsername._id,
                username: userByUsername.username,
                email: userByUsername.email,
                points: userByUsername.points,
              })
              console.log("\n⚠️ The token contains the wrong user ID!")
              console.log("Token ID:", result.decoded.id)
              console.log("Actual user ID:", userByUsername._id)
            }
          }
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
  console.log("❌ Token is invalid!")
  console.log("Error:", result.error)
}
