// Function to initialize dropdown functionality
function initializeDropdown() {
  // Get the user menu button and dropdown
  const userMenuBtn = document.getElementById("userMenuBtn");
  const userDropdown = document.getElementById("userDropdown");
  
  if (userMenuBtn && userDropdown) {
    console.log("Dropdown elements found, initializing dropdown");
    
    // Remove any existing event listeners (to prevent duplicates)
    userMenuBtn.removeEventListener("click", toggleDropdown);
    
    // Add event listener for toggle
    userMenuBtn.addEventListener("click", toggleDropdown);
    
    // Function to toggle dropdown
    function toggleDropdown(e) {
      e.stopPropagation(); // Prevent event from bubbling to document
      userDropdown.classList.toggle("show");
      console.log("Dropdown toggled:", userDropdown.classList.contains("show"));
    }
    
    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (userDropdown.classList.contains("show") && !userDropdown.contains(e.target)) {
        userDropdown.classList.remove("show");
      }
    });
    
    // Prevent dropdown from closing when clicking inside it
    userDropdown.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent event from bubbling to document
    });
    
    return true; // Initialization successful
  } else {
    console.log("Dropdown elements not found yet");
    return false; // Initialization failed
  }
}

// Create a function to check for elements and initialize dropdown
function checkAndInitializeDropdown() {
  if (!initializeDropdown()) {
    // If initialization failed, try again after a short delay
    setTimeout(checkAndInitializeDropdown, 300);
  }
}

// Make the function available globally
window.initializeDropdown = initializeDropdown;

// Start checking for elements as soon as the script loads
checkAndInitializeDropdown();