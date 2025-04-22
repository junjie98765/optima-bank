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

        // Initialize cart count and points after header is loaded
        if (file.includes("header.html")) {
          updateCartCount()
          updateUserPoints() // Update points

          // Execute any scripts in the header
          const scripts = element.querySelectorAll("script")
          scripts.forEach((script) => {
            const newScript = document.createElement("script")
            if (script.src) {
              newScript.src = script.src
            } else {
              newScript.textContent = script.textContent
            }
            document.head.appendChild(newScript)
          })

          // Initialize dropdown menu after header is loaded
          console.log("Header loaded, initializing dropdown");
          
          // Try to initialize dropdown immediately
          if (typeof window.initializeDropdown === 'function') {
            window.initializeDropdown();
          }
          
          // Also try again after a short delay to ensure all scripts are loaded
          setTimeout(() => {
            if (typeof window.initializeDropdown === 'function') {
              window.initializeDropdown();
            } else {
              console.error("dropdown-menu.js not loaded properly");
            }
          }, 500);

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

  // Update user points function
  function updateUserPoints() {
    if (window.pointsManager) {
      window.pointsManager.fetchPoints()
    } else {
      console.warn("Points manager not available")
      // If points manager is not available yet, try again in a moment
      setTimeout(() => {
        if (window.pointsManager) {
          window.pointsManager.fetchPoints()
        }
      }, 500)
    }
  }
})