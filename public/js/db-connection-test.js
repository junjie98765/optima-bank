// Database connection test utility
class DBConnectionTest {
    constructor() {
      this.lastTestResult = null
      this.isRunning = false
    }
  
    async testConnection() {
      if (this.isRunning) return
  
      this.isRunning = true
      console.log("Starting database connection test...")
  
      try {
        const response = await fetch("/api/db-status")
  
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            `Failed to check database status: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`,
          )
        }
  
        const result = await response.json()
        this.lastTestResult = result
  
        console.log("Database connection test result:", result)
  
        if (result.connected) {
          console.log("✅ Database connection successful")
        } else {
          console.error("❌ Database connection failed:", result.error)
        }
  
        return result
      } catch (error) {
        console.error("Error testing database connection:", error)
        this.lastTestResult = {
          connected: false,
          error: error.message,
        }
        return this.lastTestResult
      } finally {
        this.isRunning = false
      }
    }
  }
  
  // Initialize the connection test utility
  window.dbConnectionTest = new DBConnectionTest()
  
  // Run a test on page load
  document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded, will test database connection in 1 second...")
    setTimeout(() => {
      window.dbConnectionTest.testConnection().then((result) => {
        if (!result.connected) {
          console.error(
            "MongoDB connection test failed. Please check your connection string and make sure MongoDB is running.",
          )
        }
      })
    }, 1000)
  })
  