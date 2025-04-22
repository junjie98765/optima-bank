// Enhanced Points Manager - Handles fetching, displaying, and updating user points

class PointsManager {
    constructor() {
      this.points = 0
      this.pointsElements = []
      this.debugMode = true // Enable debug mode
      this.initialized = false
      this.retryCount = 0
      this.maxRetries = 3
    }
  
    // Debug log function
    debug(...args) {
      if (this.debugMode) {
        console.log("[PointsManager]", ...args)
      }
    }
  
    // Initialize the points manager
    init() {
      if (this.initialized) return
  
      this.debug("Initializing points manager...")
  
      // Find all elements with data-points-display attribute
      this.pointsElements = document.querySelectorAll("[data-points-display]")
      this.debug(`Found ${this.pointsElements.length} points display elements with data-points-display attribute`)
  
      // Also include elements with ID userPoints (for backward compatibility)
      const userPointsElements = document.querySelectorAll("#userPoints")
      this.debug(`Found ${userPointsElements.length} userPoints elements with ID userPoints`)
  
      // Fetch points
      this.fetchPoints()
        .then((points) => {
          if (points !== null) {
            this.debug(`Successfully fetched points: ${points}`)
            // Force update all displays after a short delay to ensure DOM is ready
            setTimeout(() => {
              this.updatePointsDisplay()
              this.updateProgressBar()
            }, 100)
          }
        })
        .catch((error) => {
          console.error("Error during initialization:", error)
        })
  
      this.initialized = true
  
      // Set up a periodic refresh every 30 seconds
      setInterval(() => this.refreshPoints(), 30000)
    }
  
    // Refresh points data
    async refreshPoints() {
      this.debug("Refreshing points data...")
      await this.fetchPoints()
      this.updatePointsDisplay()
      this.updateProgressBar()
    }
  
    // Fetch current user's points from the server
    async fetchPoints() {
      try {
        this.debug("Fetching points from server...")
        const response = await fetch("/api/points", {
          credentials: "include", // Important: Include cookies for authentication
          headers: {
            Accept: "application/json",
          },
          // Add cache busting parameter
          cache: "no-store",
        })
  
        this.debug("API Response Status:", response.status)
  
        if (!response.ok) {
          const errorText = await response.text()
          this.debug("Error response:", errorText)
          throw new Error(`Failed to fetch points: ${response.status} ${response.statusText}`)
        }
  
        const data = await response.json()
        this.debug("Points data received:", data)
  
        if (data && typeof data.points === "number") {
          this.points = data.points
          this.updatePointsDisplay()
          this.updateProgressBar()
          return this.points
        } else {
          this.debug("Invalid points data received:", data)
          throw new Error("Invalid points data format")
        }
      } catch (error) {
        console.error("Error fetching points:", error)
  
        // Retry logic for transient errors
        if (this.retryCount < this.maxRetries) {
          this.retryCount++
          this.debug(`Retrying fetch (${this.retryCount}/${this.maxRetries})...`)
          await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second before retry
          return this.fetchPoints()
        }
  
        // If all retries fail, use cached value or default
        this.debug("All retries failed, using cached or default value")
        return null
      }
    }
  
    // Update all points display elements on the page
    updatePointsDisplay() {
      // Refresh the elements list in case new elements were added
      this.pointsElements = document.querySelectorAll("[data-points-display]")
      const userPointsElements = document.querySelectorAll("#userPoints")
  
      this.debug(`Updating ${this.pointsElements.length} data-points-display elements with value: ${this.points}`)
      this.debug(`Updating ${userPointsElements.length} #userPoints elements with value: ${this.points}`)
  
      // Update elements with data-points-display attribute
      this.pointsElements.forEach((element, index) => {
        this.debug(`Updating element ${index}:`, element)
        element.textContent = this.points
      })
  
      // Update elements with ID userPoints (for backward compatibility)
      userPointsElements.forEach((element, index) => {
        this.debug(`Updating userPoints element ${index}:`, element)
        element.textContent = this.points
      })
  
      // Dispatch a custom event to notify other components
      document.dispatchEvent(new CustomEvent("pointsUpdated", { detail: { points: this.points } }))
    }
  
    // Update the progress bar based on points
    updateProgressBar() {
      const progressFill = document.querySelector(".progress-fill")
      if (progressFill) {
        this.debug("Updating progress bar")
        // Calculate percentage (assuming max is 1000 points)
        const maxPoints = 1000
        const percentage = Math.min(100, (this.points / maxPoints) * 100)
        progressFill.style.width = `${percentage}%`
  
        // Also update the middle label if it exists
        const middleLabel = document.querySelector(".progress-labels span:nth-child(2)")
        if (middleLabel) {
          middleLabel.textContent = `${this.points} points`
        }
      } else {
        this.debug("Progress bar element not found")
      }
    }
  
    // Update points in the database (add or deduct)
    async updatePoints(points, operation) {
      try {
        this.debug(`Updating points: ${operation} ${points}`)
        const response = await fetch("/api/points/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include", // Important: Include cookies for authentication
          body: JSON.stringify({ points, operation }),
        })
  
        if (!response.ok) {
          const errorText = await response.text()
          this.debug("Error response:", errorText)
          throw new Error(`Failed to update points: ${response.status} ${response.statusText}`)
        }
  
        const data = await response.json()
        this.debug("Update points response:", data)
        this.points = data.points
        this.updatePointsDisplay()
        this.updateProgressBar()
        return {
          success: true,
          points: this.points,
          message: data.message,
        }
      } catch (error) {
        console.error("Error updating points:", error)
        return {
          success: false,
          message: error.message,
        }
      }
    }
  
    // Deduct points (for voucher redemption)
    async deductPoints(points) {
      return this.updatePoints(points, "deduct")
    }
  
    // Add points (for rewards, etc.)
    async addPoints(points) {
      return this.updatePoints(points, "add")
    }
  
    // Force set points (for testing)
    async setPoints(points) {
      try {
        this.debug(`Force setting points to: ${points}`)
        const response = await fetch("/api/points/force-update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include", // Important: Include cookies for authentication
          body: JSON.stringify({ points }),
        })
  
        if (!response.ok) {
          const errorText = await response.text()
          this.debug("Error response:", errorText)
          throw new Error(`Failed to set points: ${response.status} ${response.statusText}`)
        }
  
        const data = await response.json()
        this.debug("Set points response:", data)
        this.points = data.points
        this.updatePointsDisplay()
        this.updateProgressBar()
        return {
          success: true,
          points: this.points,
          message: data.message,
        }
      } catch (error) {
        console.error("Error setting points:", error)
        return {
          success: false,
          message: error.message,
        }
      }
    }
  }
  
  // Create a global instance of PointsManager
  window.pointsManager = new PointsManager()
  
  // Initialize points display when the DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    console.log("Points Manager: DOM loaded, initializing...")
  
    // Initialize the points manager with a slight delay to ensure DOM is fully loaded
    setTimeout(() => {
      window.pointsManager.init()
    }, 500)
  })
  
  // Also initialize when the window is fully loaded (as a backup)
  window.addEventListener("load", () => {
    console.log("Points Manager: Window loaded, ensuring initialization...")
  
    // Check if already initialized
    if (!window.pointsManager.initialized) {
      window.pointsManager.init()
    } else {
      // Force a refresh if already initialized
      window.pointsManager.refreshPoints()
    }
  })
  
  // Export the pointsManager instance
  if (typeof module !== "undefined" && module.exports) {
    module.exports = window.pointsManager
  }
  