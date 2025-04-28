// public/js/voucher-display.js
document.addEventListener("DOMContentLoaded", () => {
    // Initialize cart from cartManager if available
    if (!window.cartManager) {
      console.error("Cart manager not available")
      return
    }
  
    // Function to display notifications
    function showNotification(message, type = "success") {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.innerHTML = `
          <div class="notification-content">
              <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
              <span>${message}</span>
          </div>
      `;
      
      // Add notification to body
      document.body.appendChild(notification);
      
      // Show notification
      setTimeout(() => {
          notification.classList.add('show');
      }, 10);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
          notification.classList.remove('show');
          setTimeout(() => {
              document.body.removeChild(notification);
          }, 300);
      }, 3000);
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