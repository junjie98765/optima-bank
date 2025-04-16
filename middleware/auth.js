const jwt = require("jsonwebtoken")
const User = require("../models/user")

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token

    if (!token) {
      return res.redirect("/signin.html")
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET)

    // Find user
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.redirect("/signin.html")
    }

    // Attach user to request
    req.user = user
    next()
  } catch (error) {
    console.error("Authentication error:", error)
    res.redirect("/signin.html")
  }
}

module.exports = { authenticate }
