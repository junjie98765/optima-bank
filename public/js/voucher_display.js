// This script handles the voucher display page functionality
document.addEventListener("DOMContentLoaded", () => {
    // Initialize cart from cartManager if available
    if (!window.cartManager) {
      console.error("Cart manager not available")
      return
    }
  
    // Function to display notifications
    function showNotification(message, type = "success") {
      const notificationDiv = document.createElement("div")
      notificationDiv.classList.add("notification", type)
      notificationDiv.textContent = message
      document.body.appendChild(notificationDiv)
  
      // Remove the notification after a few seconds
      setTimeout(() => {
        notificationDiv.remove()
      }, 3000)
    }
  
    // Add to cart functionality
    document.querySelectorAll(".cart-btn").forEach((button) => {
      button.addEventListener("click", async function () {
        const voucherId = this.dataset.id
        const card = this.closest(".voucher-card")
        const quantityInput = card.querySelector(".quantity-input")
        const quantity = Number.parseInt(quantityInput.value) || 1
  
        try {
          // Fetch voucher details from API
          const response = await fetch(`/api/vouchers/${voucherId}`)
          if (!response.ok) {
            throw new Error("Failed to fetch voucher details")
          }
  
          const voucher = await response.json()
  
          // Add to cart using cartManager
          await window.cartManager.addItem({
            id: voucherId,
            name: voucher.name,
            points: voucher.points,
            quantity: quantity,
            description: voucher.description,
            validity: voucher.validity,
            terms: voucher.terms,
            iconClass: voucher.iconClass,
          })
  
          // Show confirmation and reset quantity
          showNotification(`Added ${quantity} ${voucher.name} voucher(s) to your cart!`)
          quantityInput.value = 1
        } catch (error) {
          console.error("Error adding to cart:", error)
          showNotification("Failed to add voucher to cart. Please try again.", "error")
        }
      })
    })
  })
  