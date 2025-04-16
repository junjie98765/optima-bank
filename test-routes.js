// This script tests if the routes are properly registered
console.log("Testing routes configuration...")

// Import Express and create a test app
const express = require("express")
const path = require("path")
const app = express()
const PORT = 3001

// Import routes
const redeemRoutes = require("./routes/redeem")

// Use routes
app.use("/redeem", redeemRoutes)
app.use(express.static(path.join(__dirname, "public")))

// Start test server
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`)
  console.log(`Routes registered:`)
  console.log(`- /redeem`)
  console.log(`Try accessing: http://localhost:${PORT}/redeem?id=test&quantity=1`)
})
