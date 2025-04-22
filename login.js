/**
 * Simple login function to set auth token
 */
async function login(username, password) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })
  
      if (!response.ok) {
        throw new Error("Login failed")
      }
  
      const data = await response.json()
  
      // Store token in cookie
      document.cookie = `auth_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
  
      // Redirect to dashboard or reload page
      window.location.href = "/voucher_display.html"
  
      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }
  
  // For testing purposes, you can call this function to simulate a login
  // This would normally be called from a login form
  function simulateLogin() {
    login("demo_user", "password123")
  }
  
  // Export for use in other files
  window.loginUser = login
  window.simulateLogin = simulateLogin
  