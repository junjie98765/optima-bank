// Points Manager - handles fetching and refreshing points
window.pointsManager = {
  // Fetch points from the API
  async fetchPoints() {
    const response = await fetch("/api/points")

    if (!response.ok) {
      throw new Error("Failed to fetch points")
    }

    const data = await response.json()
    return data.points
  },

  // Update the UI with the points
  updatePointsDisplay(points) {
    // Update all elements displaying points
    document.querySelectorAll("[data-points-display]").forEach((el) => {
      el.textContent = points.toLocaleString()
      // Reset any error styling
      el.style.color = ""
      el.title = ""
    })

    // Also update elements with ID 'userPoints'
    document.querySelectorAll("#userPoints").forEach((el) => {
      el.textContent = points.toLocaleString()
      // Reset any error styling
      el.style.color = ""
      el.title = ""
    })

    // Update progress bar fill
    const progressFill = document.querySelector(".progress-fill")
    if (progressFill) {
      const percent = Math.min((points / 1000) * 100, 100)
      progressFill.style.width = `${percent}%`
    }
  },

  // Refresh points from the API
  async refreshPoints() {
    try {
      const points = await this.fetchPoints()
      this.updatePointsDisplay(points)
      return points
    } catch (error) {
      console.error("Error refreshing points:", error)

      // Show error state in the UI
      document.querySelectorAll("[data-points-display], #userPoints").forEach((el) => {
        el.style.color = "#ff5555"
        el.title = "Error loading points. Click refresh to try again."
      })

      throw error
    }
  },
}
