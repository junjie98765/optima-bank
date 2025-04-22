document.addEventListener("DOMContentLoaded", () => {
    console.log("Include Header: DOM loaded, initializing...")
  
    // Find all elements with the data-include attribute
    const includes = document.querySelectorAll("[data-include]")
    console.log(`Found ${includes.length} elements with data-include attribute`)
  
    // Process each include
    includes.forEach((element) => {
      const file = element.getAttribute("data-include")
      console.log(`Loading include: ${file}`)
  
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
          console.log(`Successfully loaded include: ${file}`)
  
          // Initialize cart count after header is loaded
          if (file.includes("header.html")) {
            console.log("Header loaded, initializing cart count and points manager")
            updateCartCount()
  
            // Add event listener for cart button
            const cartBtn = document.getElementById("cartBtn")
            if (cartBtn) {
              cartBtn.addEventListener("click", () => {
                const cartModal = document.getElementById("cartModal")
                if (cartModal) {
                  updateCartModal()
                  cartModal.style.display = "flex"
                } else {
                  window.location.href = "/cart"
                }
              })
            }
  
            // Load points-manager.js script after header is loaded
            loadPointsManager()
          }
  
          // Dispatch a custom event to notify that the include has been loaded
          const event = new CustomEvent("includeLoaded", {
            detail: { file, element },
          })
          document.dispatchEvent(event)
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
  
    // Load points manager function
    const loadPointsManager = () => {
      console.log("Loading points-manager.js...")
  
      // Check if points-manager.js is already loaded
      if (window.pointsManager) {
        console.log("Points manager already loaded, refreshing points...")
        window.pointsManager.refreshPoints()
        return
      }
  
      // Use the fixed version if available, otherwise fall back to the original
      const scriptSrc = "/js/points-manager-fixed.js"
  
      // Check if the script is already in the document
      if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
        const script = document.createElement("script")
        script.src = scriptSrc
        script.onerror = () => {
          console.error(`Error loading ${scriptSrc}, trying fallback...`)
          // Try loading the original as fallback
          const fallbackScript = document.createElement("script")
          fallbackScript.src = "/js/points-manager.js"
          fallbackScript.onerror = () => {
            console.error("Error loading points-manager.js")
          }
          fallbackScript.onload = () => {
            console.log("Fallback points-manager.js loaded successfully")
          }
          document.body.appendChild(fallbackScript)
        }
        script.onload = () => {
          console.log(`${scriptSrc} loaded successfully`)
        }
        document.body.appendChild(script)
      }
    }
  
    // Update cart modal function (Declaration)
    function updateCartModal() {
      // Implementation for updating the cart modal
      // This is a placeholder, replace with your actual logic
      console.log("Updating cart modal...")
  
      // If the updateCartModal function exists globally, call it
      if (typeof window.updateCartModal === "function") {
        window.updateCartModal()
      }
    }
  })
  
  // Also initialize when the window is fully loaded (as a backup)
  window.addEventListener("load", () => {
    console.log("Include Header: Window loaded, checking initialization...")
  
    // Check if any includes failed to load
    const includes = document.querySelectorAll("[data-include]")
    includes.forEach((element) => {
      if (!element.innerHTML || element.innerHTML.includes("Error loading")) {
        const file = element.getAttribute("data-include")
        console.log(`Retrying failed include: ${file}`)
  
        // Retry loading the include
        fetch(file)
          .then((response) => response.text())
          .then((html) => {
            element.innerHTML = html
            console.log(`Successfully reloaded include: ${file}`)
  
            // If this is the header, initialize points manager
            if (file.includes("header.html") && typeof loadPointsManager === "function") {
              loadPointsManager()
            }
          })
          .catch((error) => {
            console.error(`Error reloading include: ${file}`, error)
          })
      }
    })
  })
  