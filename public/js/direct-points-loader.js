// This script handles loading points directly from the database
document.addEventListener("DOMContentLoaded", async () => {
    try {
      // Fetch points from the API
      const response = await fetch("/api/points")
  
      if (!response.ok) {
        throw new Error("Failed to fetch points from API")
      }
  
      const data = await response.json()
  
      // Update all elements displaying points
      document.querySelectorAll("[data-points-display]").forEach((el) => {
        el.textContent = data.points.toLocaleString()
      })
  
      // Also update elements with ID 'userPoints'
      document.querySelectorAll("#userPoints").forEach((el) => {
        el.textContent = data.points.toLocaleString()
      })
  
      // Update progress bar fill
      const progressFill = document.querySelector(".progress-fill")
      if (progressFill) {
        const percent = Math.min((data.points / 1000) * 100, 100)
        progressFill.style.width = `${percent}%`
      }
  
      console.log("Points loaded successfully:", data.points)
    } catch (error) {
      console.error("Error loading points:", error)
  
      // Show error state in the UI
      document.querySelectorAll("[data-points-display], #userPoints").forEach((el) => {
        el.style.color = "#ff5555"
        el.title = "Error loading points. Click refresh to try again."
      })
    }
  })
  