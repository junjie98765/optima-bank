// Add this script to the cart page, just before the closing </body> tag

// Declare the variables
let cart = JSON.parse(localStorage.getItem("voucherCart")) || []
let updateCartCount // Will be defined elsewhere, likely in header.js or similar
const confirmationModal = document.getElementById("confirmationModal")
const successModal = document.getElementById("successModal")
let showNotification // Will be defined elsewhere, likely in a common script file

// Fix for the confirmCheckoutBtn click handler
document.addEventListener("DOMContentLoaded", () => {
  const confirmCheckoutBtn = document.getElementById("confirmCheckoutBtn")

  if (confirmCheckoutBtn) {
    // Remove any existing event listeners by cloning the element
    const newConfirmBtn = confirmCheckoutBtn.cloneNode(true)
    confirmCheckoutBtn.parentNode.replaceChild(newConfirmBtn, confirmCheckoutBtn)

    // Add the new event listener
    newConfirmBtn.addEventListener("click", async function () {
      // Disable the button to prevent multiple clicks
      this.disabled = true
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...'

      try {
        // Calculate total points
        const totalPoints = cart.reduce((total, item) => total + item.points * item.quantity, 0)

        console.log("Using pointsManager.deductPoints")
        console.log("Deducting " + totalPoints + " points...")

        // Use the pointsManager to deduct points
        const result = await window.pointsManager.deductPoints(totalPoints)

        console.log("Deduct result:", result)

        if (result && result.success) {
          // Clear cart
          cart = []
          localStorage.setItem("voucherCart", JSON.stringify(cart))

          // Update cart count in the header
          updateCartCount()

          // Hide confirmation modal and show success modal
          confirmationModal.style.display = "none"
          successModal.style.display = "flex"

          console.log("Checkout completed successfully")
        } else {
          // Show error message
          showNotification(result.message || "Failed to deduct points. Please try again.", "error")

          // Reset button
          this.disabled = false
          this.innerHTML = "Confirm"

          // Hide confirmation modal
          confirmationModal.style.display = "none"
        }
      } catch (error) {
        console.error("Error during checkout:", error)
        showNotification("An error occurred during checkout. Please try again.", "error")

        // Reset button
        this.disabled = false
        this.innerHTML = "Confirm"

        // Hide confirmation modal
        confirmationModal.style.display = "none"
      }
    })
  }
})

// Add a fallback implementation for local testing
// This will simulate the API if it's not available
;(() => {
  // Check if we're in a local/test environment without a real API
  const isLocalTesting =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:"

  if (isLocalTesting) {
    // Override the fetch function to handle our specific API endpoints
    const originalFetch = window.fetch
    window.fetch = (url, options) => {
      // If this is a points API call
      if (url === "/api/points") {
        console.log("Intercepting points API call for local testing")
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ points: 1900 }),
        })
      }

      // If this is a deduct points API call
      if (url === "/api/points/deduct" && options && options.method === "POST") {
        console.log("Intercepting deduct points API call for local testing")

        try {
          const body = JSON.parse(options.body)
          const pointsToDeduct = body.points

          // Get current points from UI
          const userPointsElement = document.getElementById("userPoints")
          let currentPoints = 0

          if (userPointsElement) {
            currentPoints = Number.parseInt(userPointsElement.textContent.replace(/,/g, ""))
          }

          // Check if user has enough points
          if (currentPoints < pointsToDeduct) {
            return Promise.resolve({
              ok: false,
              json: () =>
                Promise.resolve({
                  message: "Not enough points",
                }),
            })
          }

          // Deduct points
          const newPoints = currentPoints - pointsToDeduct

          // Return success response
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                success: true,
                points: newPoints,
              }),
          })
        } catch (error) {
          console.error("Error in mock deduct points:", error)
          return Promise.resolve({
            ok: false,
            json: () =>
              Promise.resolve({
                message: "An error occurred",
              }),
          })
        }
      }

      // For all other requests, use the original fetch
      return originalFetch(url, options)
    }
  }
})()
