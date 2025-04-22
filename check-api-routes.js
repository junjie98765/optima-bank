// This script checks if the API routes are properly registered and accessible
const express = require("express")
const path = require("path")
const fs = require("fs")

// Check if routes/points.js exists
console.log("Checking if routes/points.js exists...")
const pointsRoutePath = path.join(__dirname, "routes", "points.js")
if (fs.existsSync(pointsRoutePath)) {
  console.log("✅ routes/points.js file exists")

  // Check file content
  const pointsRouteContent = fs.readFileSync(pointsRoutePath, "utf8")
  if (pointsRouteContent.includes("router.get('/'")) {
    console.log("✅ GET / endpoint is defined in routes/points.js")
  } else {
    console.log("❌ GET / endpoint is NOT defined in routes/points.js")
  }
} else {
  console.log("❌ routes/points.js file does NOT exist")
}

// Check if app.js includes the points routes
console.log("\nChecking if app.js includes the points routes...")
const appJsPath = path.join(__dirname, "app.js")
if (fs.existsSync(appJsPath)) {
  console.log("✅ app.js file exists")

  // Check file content
  const appJsContent = fs.readFileSync(appJsPath, "utf8")
  if (appJsContent.includes("app.use('/api/points'")) {
    console.log("✅ Points routes are registered in app.js")
  } else {
    console.log("❌ Points routes are NOT registered in app.js")
  }
} else {
  console.log("❌ app.js file does NOT exist")
}

// Check if models/user.js exists
console.log("\nChecking if models/user.js exists...")
const userModelPath = path.join(__dirname, "models", "user.js")
if (fs.existsSync(userModelPath)) {
  console.log("✅ models/user.js file exists")
} else {
  console.log("❌ models/user.js file does NOT exist")
}

console.log("\nCheck complete. If any ❌ appears above, you need to fix those issues.")
