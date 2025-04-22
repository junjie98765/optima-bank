// This script forces an update of the points display on all pages
;(() => {
    console.log("Force Update Points: Script loaded")
  
    // Function to fetch points from API
    async function fetchPoints() {
      try {
        console.log("Fetching points from API...")
        const response = await fetch("/api/points", {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store", // Prevent caching
        })
  
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }
  
        const data = await response.json()
        console.log("Points data received:", data)
        return data.points
      } catch (error) {
        console.error("Error fetching points:", error)
        return null
      }
    }
  
    // Function to update all points displays on the page
    function updatePointsDisplays(points) {
      if (points === null) return
  
      console.log(`Updating all points displays with value: ${points}`)
  
      // Update elements with data-points-display attribute
      const pointsElements = document.querySelectorAll("[data-points-display]")
      console.log(`Found ${pointsElements.length} elements with data-points-display attribute`)
      pointsElements.forEach((element) => {
        element.textContent = points
      })
  
      // Update elements with ID userPoints
      const userPointsElements = document.querySelectorAll("#userPoints")
      console.log(`Found ${userPointsElements.length} elements with ID userPoints`)
      userPointsElements.forEach((element) => {
        element.textContent = points
      })
  
      // Update progress bar if it exists
      const progressFill = document.querySelector(".progress-fill")
      if (progressFill) {
        console.log("Updating progress bar")
        const maxPoints = 1000
        const percentage = Math.min(100, (points / maxPoints) * 100)
        progressFill.style.width = `${percentage}%`
  
        // Update middle label
        const middleLabel = document.querySelector(".progress-labels span:nth-child(2)")
        if (middleLabel) {
          middleLabel.textContent = `${points} points`
        }
      }
  
      // If pointsManager exists, update its points value
      if (window.pointsManager) {
        console.log("Updating pointsManager points value")
        window.pointsManager.points = points
      }
    }
  
    // Function to initialize the script
    async function init() {
      console.log("Initializing force update points script")
  
      // Wait for DOM to be fully loaded
      if (document.readyState !== "complete") {
        console.log("DOM not yet complete, waiting...")
        window.addEventListener("load", initAfterLoad)
        return
      }
  
      // Fetch points and update displays
      const points = await fetchPoints()
      if (points !== null) {
        updatePointsDisplays(points)
      }
  
      // Set up periodic refresh
      setInterval(async () => {
        console.log("Performing periodic refresh of points")
        const refreshedPoints = await fetchPoints()
        if (refreshedPoints !== null) {
          updatePointsDisplays(refreshedPoints)
        }
      }, 10000) // Refresh every 10 seconds
    }
  
    function initAfterLoad() {
      console.log("DOM now complete, initializing")
      window.removeEventListener("load", initAfterLoad)
      init()
    }
  
    // Start initialization
    init()
  })()
  