// Authentication handler to manage user login/logout and cart association
class AuthHandler {
    constructor() {
      this.isInitialized = false
      this.init()
    }
  
    async init() {
      try {
        // Check if user is logged in
        const response = await fetch("/api/auth/user")
        if (response.ok) {
          const userData = await response.json()
          if (userData && userData.id) {
            // Set current user data globally
            window.currentUser = userData
  
            // Associate any guest cart with the user
            if (window.cartManager) {
              await window.cartManager.associateCartWithUser(userData.id)
            } else {
              // If cart manager isn't loaded yet, wait for it
              document.addEventListener(
                "cartInitialized",
                async () => {
                  await window.cartManager.associateCartWithUser(userData.id)
                },
                { once: true },
              )
            }
          }
        }
      } catch (error) {
        console.error("Error initializing auth handler:", error)
      } finally {
        this.isInitialized = true
        document.dispatchEvent(new CustomEvent("authInitialized"))
      }
    }
  
    // Handle user login
    async handleLogin(userId) {
      window.currentUser = { id: userId }
  
      // Associate any guest cart with the user
      if (window.cartManager) {
        await window.cartManager.associateCartWithUser(userId)
      }
    }
  
    // Handle user logout
    async handleLogout() {
      window.currentUser = null
  
      // Create a new guest ID for the cart
      if (window.cartManager) {
        localStorage.removeItem("userId")
        window.cartManager.userId = window.cartManager.getUserId()
        await window.cartManager.fetchCartFromDatabase()
      }
    }
  }
  
  // Initialize the auth handler
  window.authHandler = new AuthHandler()
  