// This is a standalone version of the points API that doesn't rely on the existing routes
const express = require("express")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const cors = require("cors")
require("dotenv").config()

// Create Express app
const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: "http://localhost:5000",
    credentials: true,
  }),
)

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/registration")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Define User model if it doesn't exist
let User
try {
  User = mongoose.model("User")
} catch (error) {
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
  User = mongoose.model("User", userSchema)
}

// Authentication middleware
const authenticateUser = (req, res, next) => {
  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({ message: "Authentication required" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key_here")
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" })
  }
}

// Points API routes
app.get("/api/points", authenticateUser, async (req, res) => {
  try {
    console.log("Points API: Fetching points for user ID:", req.user.id)

    const user = await User.findById(req.user.id)
    if (!user) {
      console.log("Points API: User not found with ID:", req.user.id)
      return res.status(404).json({ message: "User not found" })
    }

    console.log("Points API: Found user:", user.username, "with points:", user.points)
    res.json({
      points: user.points,
      userId: req.user.id,
      username: user.username,
    })
  } catch (error) {
    console.error("Points API Error:", error)
    res.status(500).json({ message: "Error fetching points", error: error.message })
  }
})

app.post("/api/points/update", authenticateUser, async (req, res) => {
  try {
    const { points, operation } = req.body

    if (!points || !operation) {
      return res.status(400).json({ message: "Points and operation are required" })
    }

    console.log("Points API: Updating points for user ID:", req.user.id, "Operation:", operation, "Points:", points)

    const user = await User.findById(req.user.id)
    if (!user) {
      console.log("Points API: User not found with ID:", req.user.id)
      return res.status(404).json({ message: "User not found" })
    }

    // Calculate new points based on operation
    let newPoints = user.points
    if (operation === "deduct") {
      if (user.points < points) {
        return res.status(400).json({ message: "Insufficient points" })
      }
      newPoints = user.points - points
    } else if (operation === "add") {
      newPoints = user.points + points
    } else {
      return res.status(400).json({ message: "Invalid operation" })
    }

    // Update user's points
    user.points = newPoints
    await user.save()

    console.log("Points API: Updated points for user:", user.username, "New points:", user.points)

    res.json({
      success: true,
      points: user.points,
      message:
        operation === "deduct" ? `${points} points deducted successfully` : `${points} points added successfully`,
    })
  } catch (error) {
    console.error("Points API Error:", error)
    res.status(500).json({ message: "Error updating points", error: error.message })
  }
})

// Force update user's points (admin only - for testing)
app.post("/api/points/force-update", authenticateUser, async (req, res) => {
  try {
    const { points } = req.body

    if (points === undefined) {
      return res.status(400).json({ message: "Points value is required" })
    }

    console.log("Points API: Force updating points for user ID:", req.user.id, "New points:", points)

    const user = await User.findById(req.user.id)
    if (!user) {
      console.log("Points API: User not found with ID:", req.user.id)
      return res.status(404).json({ message: "User not found" })
    }

    // Update user's points
    user.points = points
    await user.save()

    console.log("Points API: Force updated points for user:", user.username, "New points:", user.points)

    res.json({
      success: true,
      points: user.points,
      message: `Points updated to ${points}`,
    })
  } catch (error) {
    console.error("Points API Error:", error)
    res.status(500).json({ message: "Error updating points", error: error.message })
  }
})

// Debug endpoint
app.get("/api/points/debug", authenticateUser, async (req, res) => {
  try {
    console.log("Points Debug API: Fetching user details for ID:", req.user.id)

    const user = await User.findById(req.user.id)
    if (!user) {
      console.log("Points Debug API: User not found with ID:", req.user.id)
      return res.status(404).json({ message: "User not found" })
    }

    // Return user details (excluding sensitive information)
    res.json({
      userId: user._id,
      username: user.username,
      email: user.email,
      points: user.points,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  } catch (error) {
    console.error("Points Debug API Error:", error)
    res.status(500).json({ message: "Error fetching user details", error: error.message })
  }
})

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" })
})

// Start server
app.listen(PORT, () => {
  console.log(`Standalone Points API running on port ${PORT}`)
  console.log(`API available at http://localhost:${PORT}/api/points`)
})
