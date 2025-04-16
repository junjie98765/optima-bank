// This script helps restart the server
const { exec } = require("child_process")
const path = require("path")

console.log("Restarting server...")

// Kill any existing Node.js processes
exec("pkill -f node || true", (error, stdout, stderr) => {
  if (error) {
    console.log("No existing Node.js processes found or error killing processes")
  } else {
    console.log("Killed existing Node.js processes")
  }

  // Start the server
  const server = exec("node app.js", {
    cwd: path.resolve(__dirname),
  })

  server.stdout.on("data", (data) => {
    console.log(`Server output: ${data}`)
  })

  server.stderr.on("data", (data) => {
    console.error(`Server error: ${data}`)
  })

  server.on("close", (code) => {
    console.log(`Server process exited with code ${code}`)
  })

  console.log("Server restarted")
})
