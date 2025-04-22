// This script creates a new JWT token for a user
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
require("dotenv").config()

// Import the User model schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  phone: String,
  password: String,
  points: {
    type: Number,
    default: 500,
  },
  googleId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Register the User model
const User = mongoose.model("User", userSchema)

// Function to create a new token
function createToken(userId, username) {
  return jwt.sign({ id: userId, username }, process.env.JWT_SECRET || "your_jwt_secret_key_here", { expiresIn: "1d" })
}

// Get username from command line argument
const username = process.argv[2]

if (!username) {
  console.log("Please provide a username as a command line argument")
  console.log("Example: node fix-token.js johndoe")
  process.exit(1)
}

// Connect to MongoDB and find user
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/registration")
  .then(async () => {
    console.log("Connected to MongoDB")

    try {
      // Find user by username
      const user = await User.findOne({ username })

      if (user) {
        console.log("✅ User found in database:")
        console.log({
          id: user._id,
          username: user.username,
          email: user.email,
          points: user.points,
        })

        // Create a new token
        const token = createToken(user._id, user.username)
        console.log("\n✅ New token created:")
        console.log(token)

        console.log("\nTo use this token:")
        console.log("1. Open your browser's developer tools (F12)")
        console.log("2. Go to the Console tab")
        console.log("3. Run this command:")
        console.log(`   document.cookie = "token=${token}; path=/;"`)
        console.log("4. Refresh the page")
      } else {
        console.log("❌ User not found with username:", username)

        // List available users
        const users = await User.find({}, "username")
        if (users.length > 0) {
          console.log("\nAvailable users:")
          users.forEach((u) => console.log(`- ${u.username}`))
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