// Import required modules
const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const cors = require("cors")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const path = require("path")
const passport = require("passport")
// Comment out or remove the GoogleStrategy line if you're not using it yet
const GoogleStrategy = require("passport-google-oauth20").Strategy
require("dotenv").config()
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")

// Import routes
const voucherRoutes = require("./routes/vouchers")
const authRoutes = require("./routes/auth")

// Initialize Express
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(
  cors({
    origin: "http://localhost:5000",
    credentials: true,
  }),
)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

// Authentication middleware
const authenticateUser = (req, res, next) => {
  const token = req.cookies.token

  if (!token) {
    // For API routes, return 401
    if (req.path.startsWith("/api/")) {
      return res.status(401).json({ message: "Authentication required" })
    }
    // For page routes, redirect to login
    return res.redirect("/signin.html")
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    // For API routes, return 401
    if (req.path.startsWith("/api/")) {
      return res.status(401).json({ message: "Invalid token" })
    }
    // For page routes, redirect to login
    res.clearCookie("token")
    return res.redirect("/signin.html")
  }
}

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error("Global error handler caught:", err.stack)
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "production" ? "Something went wrong" : err.message,
  })
})

// Connect to MongoDB with more detailed error handling
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/registration", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => {
    console.error("MongoDB connection error:", err)
    console.error("Connection details:", {
      host: "localhost",
      port: "27017",
      database: "registration",
    })
  })

// Debug MongoDB connection
const db = mongoose.connection
db.on("error", (err) => {
  console.error("MongoDB connection error event:", err)
})
db.once("open", () => {
  console.log("MongoDB connection open event fired")
  // List all collections in the database
  db.db.listCollections().toArray((err, collections) => {
    if (err) {
      console.error("Error listing collections:", err)
    } else {
      console.log(
        "Available collections:",
        collections.map((c) => c.name),
      )
    }
  })
})

// Use routes
app.use("/api/vouchers", voucherRoutes)
app.use("/", authRoutes)

// Protected routes - require authentication
app.get("/voucher_display.html", authenticateUser, (req, res) => {
  res.sendFile(path.join(__dirname, "public/voucher_display.html"))
})

app.get("/redeem", authenticateUser, (req, res) => {
  res.sendFile(path.join(__dirname, "public/redeem.html"))
})

app.get("/cart", authenticateUser, (req, res) => {
  res.sendFile(path.join(__dirname, "public/cart.html"))
})

// Add a test route to verify the server is running
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" })
})

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: "262201707875-fsd8diveqkc8taqvikf7sd5n6u05hu16.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Import User model here to avoid circular dependencies
        const User = mongoose.model("User")
        const existingUser = await User.findOne({ email: profile.emails[0].value })

        if (!existingUser) {
          const newUser = new User({
            username: profile.displayName,
            email: profile.emails[0].value,
            phone: "",
            password: "",
          })
          await newUser.save()
        }

        return done(null, profile)
      } catch (error) {
        return done(error, null)
      }
    },
  ),
)

// Serve redeem page
app.get("/redeem.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "redeem.html"))
})

// Admin routes for vouchers
app.get("/admin/vouchers", async (req, res) => {
  try {
    const Voucher = mongoose.model("Voucher")
    const vouchers = await Voucher.find()
    res.json(vouchers)
  } catch (err) {
    res.status(500).send("Error fetching vouchers")
  }
})

// Admin route to update a voucher by ID
app.put("/admin/vouchers/:id", async (req, res) => {
  const { id } = req.params
  const { name, description, points, category, validity, terms, iconClass, isActive } = req.body

  try {
    const Voucher = mongoose.model("Voucher")
    const updatedVoucher = await Voucher.findByIdAndUpdate(
      id,
      { name, description, points, category, validity, terms, iconClass, isActive },
      { new: true },
    )

    if (!updatedVoucher) {
      return res.status(404).send("Voucher not found")
    }

    res.json(updatedVoucher)
  } catch (err) {
    res.status(500).send("Error updating voucher")
  }
})

// Admin route to delete a voucher by ID
app.delete("/admin/vouchers/:id", async (req, res) => {
  const { id } = req.params

  try {
    const Voucher = mongoose.model("Voucher")
    const deletedVoucher = await Voucher.findByIdAndDelete(id)
    if (!deletedVoucher) {
      return res.status(404).send("Voucher not found")
    }

    res.json({ message: "Voucher deleted successfully" })
  } catch (err) {
    res.status(500).send("Error deleting voucher")
  }
})

// Start Server with better error handling
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`API available at http://localhost:${PORT}/api/vouchers`)
  console.log(`Sign in page available at http://localhost:${PORT}/signin.html`)
})
