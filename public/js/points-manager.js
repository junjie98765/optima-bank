// Points Manager - handles fetching and refreshing points
window.pointsManager = {
  // Fetch points from the API
  async fetchPoints() {
    try {
      // Use relative URL to ensure it works in both development and production
      const response = await fetch("/api/points")

      if (!response.ok) {
        throw new Error("Failed to fetch points")
      }

      const data = await response.json()
      return data.points
    } catch (error) {
      console.error("Error fetching points:", error)

      // Fallback: Get points from UI or localStorage
      const userPointsElement = document.getElementById("userPoints")
      if (userPointsElement) {
        return Number.parseInt(userPointsElement.textContent.replace(/,/g, ""))
      }

      // If all else fails, return 0
      return 0
    }
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

    // Store in localStorage as fallback
    try {
      localStorage.setItem("userPoints", points.toString())
    } catch (e) {
      console.error("Could not save points to localStorage", e)
    }

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

  // Deduct points from the user's account
  async deductPoints(cartId, pointsToDeduct) {
    try {
      const response = await fetch('/api/points/deduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ points: pointsToDeduct }),
        credentials: 'include', // ensure cookies/session are sent
      });
  
      if (!response.ok) {
          // Check for different error codes and do something based on the error.
          if (response.status === 404) {
              throw new Error("API endpoint not found");
          } else {
              throw new Error(`Server responded with status ${response.status}`);
          }
      }
      
      //If the response was ok, check if the response is json.
      const contentType = response.headers.get('content-type');
      if(contentType && contentType.includes('application/json')) {
          const data = await response.json();
          return data;
      } else {
        const errorText = await response.text();
        throw new Error(`Unexpected response type ${contentType}. Response text: ${errorText}`);
      }
  
    } catch (error) {
      console.error("API error details:", error.message, "status:", error.status); // added the status
      return {
        success: false,
        message: `Failed to update points: ${error.message || "Unknown error"} status: ${error.status}. Please try again.`, // added the status
      };
    }
  }
  // ...existing code...
}

