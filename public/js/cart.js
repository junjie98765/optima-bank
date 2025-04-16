// Initialize cart functionality
document.addEventListener("DOMContentLoaded", () => {
    // Get cart from API instead of localStorage
    fetchCart()
  
    // Add event listeners for cart buttons
    const addToCartButtons = document.querySelectorAll(".cart-btn")
    if (addToCartButtons) {
      addToCartButtons.forEach((button) => {
        button.addEventListener("click", addToCart)
      })
    }
  
    // Add event listener for checkout button
    const checkoutBtn = document.getElementById("checkoutBtn")
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", checkout)
    }
  
    // Add event listener for clear cart button
    const clearCartBtn = document.getElementById("clearCartBtn")
    if (clearCartBtn) {
      clearCartBtn.addEventListener("click", clearCart)
    }
  })
  
  // Fetch cart from API
  async function fetchCart() {
    try {
      const response = await fetch("/api/cart")
  
      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.status}`)
      }
  
      const cartItems = await response.json()
  
      // Update UI with cart items
      updateCartUI(cartItems)
    } catch (error) {
      console.error("Error fetching cart:", error)
      showNotification("Failed to load cart items", "error")
    }
  }
  
  // Add item to cart
  async function addToCart(event) {
    const voucherId = event.target.dataset.id
    const card = event.target.closest(".voucher-card")
    const quantityInput = card.querySelector(".quantity-input")
    const quantity = Number.parseInt(quantityInput.value) || 1
  
    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voucherId, quantity }),
      })
  
      if (!response.ok) {
        throw new Error(`Failed to add to cart: ${response.status}`)
      }
  
      const result = await response.json()
  
      // Show success notification
      showNotification(`Added ${quantity} voucher(s) to your cart!`)
  
      // Reset quantity input
      quantityInput.value = 1
  
      // Update cart count
      fetchCart()
    } catch (error) {
      console.error("Error adding to cart:", error)
      showNotification("Failed to add item to cart", "error")
    }
  }
  
  // Remove item from cart
  async function removeFromCart(voucherId) {
    try {
      const response = await fetch("/api/cart/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voucherId }),
      })
  
      if (!response.ok) {
        throw new Error(`Failed to remove from cart: ${response.status}`)
      }
  
      const result = await response.json()
  
      // Show success notification
      showNotification("Item removed from cart")
  
      // Update cart
      fetchCart()
    } catch (error) {
      console.error("Error removing from cart:", error)
      showNotification("Failed to remove item from cart", "error")
    }
  }
  
  // Update cart item quantity
  async function updateCartQuantity(voucherId, quantity) {
    try {
      const response = await fetch("/api/cart/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voucherId, quantity }),
      })
  
      if (!response.ok) {
        throw new Error(`Failed to update cart: ${response.status}`)
      }
  
      const result = await response.json()
  
      // Update cart
      fetchCart()
    } catch (error) {
      console.error("Error updating cart:", error)
      showNotification("Failed to update cart", "error")
    }
  }
  
  // Clear cart
  async function clearCart() {
    if (confirm("Are you sure you want to clear your cart?")) {
      try {
        const response = await fetch("/api/cart/clear", {
          method: "POST",
        })
  
        if (!response.ok) {
          throw new Error(`Failed to clear cart: ${response.status}`)
        }
  
        const result = await response.json()
  
        // Show success notification
        showNotification("Cart cleared successfully")
  
        // Update cart
        fetchCart()
      } catch (error) {
        console.error("Error clearing cart:", error)
        showNotification("Failed to clear cart", "error")
      }
    }
  }
  
  // Checkout
  async function checkout() {
    try {
      const response = await fetch("/api/cart/checkout", {
        method: "POST",
      })
  
      if (!response.ok) {
        const errorData = await response.json()
  
        if (errorData.error === "Not enough points") {
          showNotification(
            `You don't have enough points. You need ${errorData.required} points but have ${errorData.available}.`,
            "error",
          )
          return
        }
  
        throw new Error(`Failed to checkout: ${response.status}`)
      }
  
      const result = await response.json()
  
      // Show success notification
      showNotification("Checkout successful! Your vouchers have been redeemed.")
  
      // Update points display
      document.getElementById("userPoints").textContent = result.remainingPoints
  
      // Update cart
      fetchCart()
  
      // Show success modal if it exists
      const successModal = document.getElementById("successModal")
      if (successModal) {
        successModal.style.display = "flex"
      }
    } catch (error) {
      console.error("Error during checkout:", error)
      showNotification("Failed to complete checkout", "error")
    }
  }
  
  // Update cart UI
  function updateCartUI(cartItems) {
    // Update cart count in header
    const cartCount = document.getElementById("cartCount")
    if (cartCount) {
      const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)
      cartCount.textContent = totalItems
    }
  
    // Update cart page if on cart page
    const cartItemsContainer = document.getElementById("cartItemsContainer")
    if (cartItemsContainer) {
      if (cartItems.length === 0) {
        // Show empty cart message
        document.getElementById("emptyCartMessage").style.display = "block"
        document.getElementById("summaryContainer").style.display = "none"
        return
      }
  
      // Hide empty cart message
      document.getElementById("emptyCartMessage").style.display = "none"
      document.getElementById("summaryContainer").style.display = "block"
  
      // Clear existing items
      cartItemsContainer.innerHTML = ""
  
      // Calculate totals
      let totalItems = 0
      let totalPoints = 0
  
      // Add each cart item
      cartItems.forEach((item, index) => {
        const itemTotal = item.points * item.quantity
        totalItems += item.quantity
        totalPoints += itemTotal
  
        const cartItemElement = document.createElement("div")
        cartItemElement.className = "cart-item"
        cartItemElement.dataset.id = item.id
        cartItemElement.innerHTML = `
                  <div class="cart-item-header">
                      <h3 class="cart-item-title">${item.name}</h3>
                      <div class="cart-item-points">
                          <i class="fas fa-coins"></i> ${item.points} points
                      </div>
                  </div>
                  
                  <p class="cart-item-description">${item.description}</p>
                  
                  <div class="cart-item-footer">
                      <p class="cart-item-validity">Valid until: ${item.validity}</p>
                      
                      <div class="cart-item-actions">
                          <div class="quantity-control">
                              <button class="quantity-btn decrease-btn">
                                  <i class="fas fa-minus"></i>
                              </button>
                              <input type="number" class="quantity-input" value="${item.quantity}" min="1">
                              <button class="quantity-btn increase-btn">
                                  <i class="fas fa-plus"></i>
                              </button>
                          </div>
                          
                          <div class="cart-item-total">
                              <strong>${itemTotal}</strong> points
                          </div>
                          
                          <button class="remove-btn">
                              <i class="fas fa-trash"></i> Remove
                          </button>
                      </div>
                  </div>
              `
  
        cartItemsContainer.appendChild(cartItemElement)
  
        // Add event listeners
        const decreaseBtn = cartItemElement.querySelector(".decrease-btn")
        const increaseBtn = cartItemElement.querySelector(".increase-btn")
        const quantityInput = cartItemElement.querySelector(".quantity-input")
        const removeBtn = cartItemElement.querySelector(".remove-btn")
  
        decreaseBtn.addEventListener("click", () => {
          const currentValue = Number.parseInt(quantityInput.value) || 1
          if (currentValue > 1) {
            quantityInput.value = currentValue - 1
            updateCartQuantity(item.id, currentValue - 1)
          }
        })
  
        increaseBtn.addEventListener("click", () => {
          const currentValue = Number.parseInt(quantityInput.value) || 1
          quantityInput.value = currentValue + 1
          updateCartQuantity(item.id, currentValue + 1)
        })
  
        quantityInput.addEventListener("change", function () {
          const value = Number.parseInt(this.value) || 1
          if (value < 1) this.value = 1
          updateCartQuantity(item.id, Number.parseInt(this.value))
        })
  
        removeBtn.addEventListener("click", () => {
          removeFromCart(item.id)
        })
      })
  
      // Update summary
      document.getElementById("itemCount").textContent = `${totalItems} item${totalItems !== 1 ? "s" : ""}`
      document.getElementById("summaryItemCount").textContent = totalItems
      document.getElementById("summaryTotalPoints").textContent = totalPoints
  
      if (document.getElementById("confirmTotalPoints")) {
        document.getElementById("confirmTotalPoints").textContent = totalPoints
      }
    }
  }
  
  // Notification function
  function showNotification(message, type = "success") {
    // Create notification element
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.innerHTML = `
          <div class="notification-content">
              <i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i>
              <span>${message}</span>
          </div>
      `
  
    // Add notification to body
    document.body.appendChild(notification)
  
    // Show notification
    setTimeout(() => {
      notification.classList.add("show")
    }, 10)
  
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.classList.remove("show")
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }
  