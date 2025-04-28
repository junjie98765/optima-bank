const express = require("express")
const dotenv = require("dotenv")
const connectDB = require("./config/db")
const path = require("path")

// Load environment variables
dotenv.config()

// Create Express app
const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Serve static files
app.use(express.static(path.join(__dirname, "public")))

// Connect to database
console.log("Starting server and connecting to database...")
connectDB()
  .then((connected) => {
    if (!connected) {
      console.error("WARNING: Server starting without database connection")
    }

    // Routes
    app.use("/api/vouchers", require("../routes/vouchers"))

    // Serve HTML files
    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "voucher_display.html"))
    })

    app.get("/redeem", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "redeem.html"))
    })

    app.get("/cart", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "cart.html"))
    })

    // Admin routes
    app.get("/admin", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "admin", "index.html"))
    })

    // Error handling for API routes
    app.use("/api", (err, req, res, next) => {
      console.error("API Error:", err)
      res.status(500).json({
        message: "Server Error",
        error: process.env.NODE_ENV === "production" ? "An error occurred" : err.message,
      })
    })

    const PORT = process.env.PORT || 5000

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch((err) => {
    console.error("Failed to start server:", err)
    process.exit(1)
  })
