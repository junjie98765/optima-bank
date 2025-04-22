// This script updates a user's points directly in the database
const mongoose = require("mongoose")
require("dotenv").config()

// Get username and points from command line arguments
const username = process.argv[2]
const points = Number.parseInt(process.argv[3])

if (!username || isNaN(points)) {
  console.log("Please provide a username and points as command line arguments")
  console.log("Example: node update-user-points.js johndoe 1000")
  process.exit(1)
}

// Connect to MongoDB and update user
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/registration")
  .then(async () => {
    console.log("Connected to MongoDB")

    try {
      // Get User model
      const User = mongoose.model("User")

      // Find and update user
      const user = await User.findOneAndUpdate({ username }, { points }, { new: true })

      if (user) {
        console.log(`✅ Updated points for user ${username}:`)
        console.log({
          id: user._id,
          username: user.username,
          email: user.email,
          points: user.points,
        })
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
      console.error("Error updating user:", error)
      mongoose.connection.close()
    }
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
  })
