const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const User = mongoose.model("User")
const jwt = require("jsonwebtoken")

// Middleware to authenticate user
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

// Get current user's points
router.get("/", authenticateUser, async (req, res) => {
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

// Debug endpoint to get user details
router.get("/debug", authenticateUser, async (req, res) => {
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

// Update user's points (deduct or add)
router.post("/update", authenticateUser, async (req, res) => {
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
router.post("/force-update", authenticateUser, async (req, res) => {
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

// Get points history (for future implementation)
router.get("/history", authenticateUser, async (req, res) => {
  // This is a placeholder for future implementation
  res.json({ message: "Points history feature coming soon" })
})

module.exports = router
