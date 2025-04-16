document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signupForm")
    const username = document.getElementById("username")
    const email = document.getElementById("email")
    const phone = document.getElementById("phone")
    const password = document.getElementById("password")
    const password2 = document.getElementById("password2")
  
    form.addEventListener("submit", (e) => {
      e.preventDefault()
  
      if (validateInputs()) {
        const userData = {
          username: username.value.trim(),
          email: email.value.trim(),
          phone: phone.value.trim(),
          password: password.value.trim(),
        }
  
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]')
        const originalBtnText = submitBtn.textContent
        submitBtn.disabled = true
        submitBtn.textContent = "Processing..."
  
        fetch("/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        })
          .then((response) => {
            // Reset button state
            submitBtn.disabled = false
            submitBtn.textContent = originalBtnText
  
            if (!response.ok) {
              return response.text().then((text) => {
                throw new Error(text || "Registration failed")
              })
            }
            return response.text()
          })
          .then((data) => {
            console.log("Success:", data)
            showNotification("Registration successful! Redirecting to login page...", "success")
            setTimeout(() => {
              window.location.href = "signin.html"
            }, 2000)
          })
          .catch((err) => {
            console.error("Error:", err)
            const errorMessage = err.message
  
            // Check for specific error messages
            if (errorMessage.includes("exists")) {
              if (errorMessage.includes("Username")) {
                setError(username, "Username already exists")
              } else if (errorMessage.includes("Email")) {
                setError(email, "Email already exists")
              } else {
                showNotification("Username or email already exists", "error")
              }
            } else {
              showNotification("An error occurred during registration. Please try again.", "error")
            }
          })
      }
    })
  
    function validateInputs() {
      let isValid = true
  
      // Reset states
      resetInputState(username)
      resetInputState(email)
      resetInputState(phone)
      resetInputState(password)
      resetInputState(password2)
  
      // Validate username
      if (username.value.trim() === "") {
        setError(username, "Username is required")
        isValid = false
      } else if (username.value.trim().length < 3) {
        setError(username, "Username must be at least 3 characters")
        isValid = false
      } else {
        setSuccess(username)
      }
  
      // Validate email
      if (email.value.trim() === "") {
        setError(email, "Email is required")
        isValid = false
      } else if (!isValidEmail(email.value.trim())) {
        setError(email, "Provide a valid email address")
        isValid = false
      } else {
        setSuccess(email)
      }
  
      // Validate phone
      if (phone.value.trim() === "") {
        setError(phone, "Phone number is required")
        isValid = false
      } else if (!isValidPhone(phone.value.trim())) {
        setError(phone, "Provide a valid phone number (10-15 digits)")
        isValid = false
      } else {
        setSuccess(phone)
      }
  
      // Validate password
      if (password.value.trim() === "") {
        setError(password, "Password is required")
        isValid = false
      } else if (password.value.trim().length < 8) {
        setError(password, "Password must be at least 8 characters")
        isValid = false
      } else {
        setSuccess(password)
      }
  
      // Validate confirm password
      if (password2.value.trim() === "") {
        setError(password2, "Please confirm your password")
        isValid = false
      } else if (password2.value.trim() !== password.value.trim()) {
        setError(password2, "Passwords do not match")
        isValid = false
      } else {
        setSuccess(password2)
      }
  
      return isValid
    }
  
    function setError(element, message) {
      const inputControl = element.parentElement
      const errorDisplay = inputControl.querySelector(".error")
  
      errorDisplay.innerText = message
      inputControl.classList.add("error")
      inputControl.classList.remove("success")
    }
  
    function setSuccess(element) {
      const inputControl = element.parentElement
      const errorDisplay = inputControl.querySelector(".error")
  
      errorDisplay.innerText = ""
      inputControl.classList.add("success")
      inputControl.classList.remove("error")
    }
  
    function resetInputState(element) {
      const inputControl = element.parentElement
      const errorDisplay = inputControl.querySelector(".error")
  
      errorDisplay.innerText = ""
      inputControl.classList.remove("success")
      inputControl.classList.remove("error")
    }
  
    function isValidEmail(email) {
      const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return re.test(String(email).toLowerCase())
    }
  
    function isValidPhone(phone) {
      const re = /^[0-9]{10,15}$/
      return re.test(String(phone))
    }
  
    function showNotification(message, type = "success") {
      // Remove any existing notifications
      const existingNotifications = document.querySelectorAll(".notification")
      existingNotifications.forEach((notification) => {
        notification.remove()
      })
  
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
  
      // Remove notification after 5 seconds
      setTimeout(() => {
        notification.classList.remove("show")
        setTimeout(() => {
          notification.remove()
        }, 300)
      }, 5000)
    }
  })
  