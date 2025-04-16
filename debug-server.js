// This script helps debug server issues
const express = require("express")
const path = require("path")
const app = express()
const PORT = 3000

console.log("Starting debug server...")

// Middleware
app.use(express.static(path.join(__dirname, "public")))

// Debug route
app.get("/redeem", (req, res) => {
  console.log("Redeem route accessed with params:", req.query)
  res.sendFile(path.join(__dirname, "public/redeem.html"))
})

// Start debug server
app.listen(PORT, () => {
  console.log(`Debug server running on port ${PORT}`)
  console.log(`Try accessing: http://localhost:${PORT}/redeem?id=test&quantity=1`)
})
