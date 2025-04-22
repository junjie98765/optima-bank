// This script updates the header.html file to ensure it has the correct data attributes
const fs = require("fs")
const path = require("path")

// Path to the header.html file
const headerPath = path.join(__dirname, "public", "components", "header.html")

// Check if the file exists
if (!fs.existsSync(headerPath)) {
  console.error(`❌ Header file not found at: ${headerPath}`)
  process.exit(1)
}

// Read the current content
let headerContent = fs.readFileSync(headerPath, "utf8")
console.log("Current header content:", headerContent)

// Check if the userPoints element has the data-points-display attribute
if (headerContent.includes('id="userPoints"') && !headerContent.includes("data-points-display")) {
  console.log("Adding data-points-display attribute to userPoints element")

  // Add the attribute
  headerContent = headerContent.replace('id="userPoints"', 'id="userPoints" data-points-display')

  // Write the updated content back to the file
  fs.writeFileSync(headerPath, headerContent)
  console.log("✅ Header file updated successfully")
} else if (headerContent.includes("data-points-display")) {
  console.log("✅ Header file already has data-points-display attribute")
} else {
  console.error("❌ Could not find userPoints element in header file")
}

// Check if we need to add a script tag for force-update-points.js
if (!headerContent.includes("force-update-points.js")) {
  console.log("Adding script tag for force-update-points.js")

  // Add the script tag at the end of the file
  headerContent += '\n<script src="/js/force-update-points.js"></script>\n'

  // Write the updated content back to the file
  fs.writeFileSync(headerPath, headerContent)
  console.log("✅ Added force-update-points.js script tag")
}

console.log("Header update complete")
