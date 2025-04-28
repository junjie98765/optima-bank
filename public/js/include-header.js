document.addEventListener("DOMContentLoaded", () => {
    // Find all elements with the data-include attribute
    const includes = document.querySelectorAll("[data-include]")
  
    // Process each include
    includes.forEach((element) => {
      const file = element.getAttribute("data-include")
  
      // Fetch the file content
      fetch(file)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load ${file}: ${response.status} ${response.statusText}`)
          }
          return response.text()
        })
        .then((html) => {
          // Insert the content into the element
          element.innerHTML = html
  
          // Initialize cart count after header is loaded
          if (file.includes("header.html")) {
            updateCartCount()
  
            // Add event listener for cart button
            const cartBtn = document.getElementById("cartBtn")
            if (cartBtn) {
              cartBtn.addEventListener("click", () => {
                window.location.href = "/cart"
              })
            }
          }
        })
        .catch((error) => {
          console.error("Error loading include:", error)
          element.innerHTML = `<div class="error">Error loading ${file}: ${error.message}</div>`
        })
    })
  
    // Update cart count function
    function updateCartCount() {
      const cartCount = document.getElementById("cartCount")
      if (cartCount) {
        const cart = JSON.parse(localStorage.getItem("voucherCart")) || []
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
        cartCount.textContent = totalItems
      }
    }
  })
  