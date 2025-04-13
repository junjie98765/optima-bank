// document.getElementById("resetPasswordForm").addEventListener("submit", async function(event) {
//     event.preventDefault(); // Prevent default form submission

//     const newPassword = document.getElementById("newPassword").value;
//     const token = window.location.pathname.split("/").pop(); // Extract token from URL

//     try {
//         const response = await fetch(`http://localhost:5000/reset-password/${token}`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ newPassword })
//         });

//         const result = await response.text();
//         alert(result); // Show response message

//     } catch (error) {
//         console.error("Error:", error);
//         alert("Something went wrong. Check the console for details.");
//     }
// });

// document.getElementById("resetPasswordForm").addEventListener("submit", async function(event) {
//     event.preventDefault(); // Prevent form from submitting normally

//     const password = document.getElementById("newPassword");
//     const confirmPassword = document.getElementById("confirmPassword");
//     const message = document.getElementById("message");

//     let isValid = true;

//     // Password Validation
//     if (password.value === '') {
//         setError(password, "Password is required");
//         isValid = false;
//     } else if (password.value.length < 8) {
//         setError(password, "Password must be at least 8 characters.");
//         isValid = false;
//     } else {
//         setSuccess(password);
//     }

//     // Confirm Password Validation
//     if (confirmPassword.value === '') {
//         setError(confirmPassword, "Please confirm your password");
//         isValid = false;
//     } else if (confirmPassword.value !== password.value) {
//         setError(confirmPassword, "Passwords don't match");
//         isValid = false;
//     } else {
//         setSuccess(confirmPassword);
//     }

//     if (!isValid) return;

//     const token = window.location.pathname.split("/").pop(); // Get token from URL

//     try {
//         const response = await fetch(window.location.href, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ newPassword: password.value })
//         });
    
//         const result = await response.text();
//         message.textContent = result;
//         message.style.color = response.ok ? "green" : "red";
//     } catch (error) {
//         console.error("Error:", error);
//         message.textContent = "Something went wrong. Try again.";
//         message.style.color = "red";
//     }
    
// });

// // Utility functions for setting error/success
// function setError(input, msg) {
//     const formControl = input.parentElement;
//     formControl.querySelector("small").textContent = msg;
//     input.style.borderColor = "red";
// }

// function setSuccess(input) {
//     const formControl = input.parentElement;
//     formControl.querySelector("small").textContent = "";
//     input.style.borderColor = "green";
// }

// document.getElementById("resetPasswordForm").addEventListener("submit", async function(event) {
//     event.preventDefault(); // Prevent default form submission

//     const password = document.getElementById("newPassword");
//     const confirmPassword = document.getElementById("confirmPassword"); // Make sure this input exists in HTML
//     const passwordValue = password.value;
//     const confirmPasswordValue = confirmPassword.value;
//     const token = window.location.pathname.split("/").pop(); // Extract token from URL


    

//     // Check if the token is valid BEFORE checking password validation
//     try {
//         const tokenCheckResponse = await fetch(`http://localhost:5000/check-token/${token}`);
//         const tokenCheckResult = await tokenCheckResponse.json();

//         if (!tokenCheckResponse.ok) {
//             alert(tokenCheckResult.message); // Show token expiry message
//             return; // Stop further execution
//         }

//     } catch (error) {
//         console.error("Error checking token:", error);
//         alert("Something went wrong. Please try again.");
//         return;
//     }

//     // If token is valid, proceed to check password validation
//     let isValid = true;

//     if (passwordValue === '') {
//         setError(password, 'Password is required');
//         isValid = false;
//     } else if (passwordValue.length < 8) {
//         setError(password, 'Password must be at least 8 characters.');
//         isValid = false;
//     } else {
//         setSuccess(password);
//     }

//     if (confirmPasswordValue === '') {
//         setError(confirmPassword, 'Please confirm your password');
//         isValid = false;
//     } else if (confirmPasswordValue !== passwordValue) {
//         setError(confirmPassword, "Passwords don't match");
//         isValid = false;
//     } else {
//         setSuccess(confirmPassword);
//     }

//     // If validation fails, do not send request
//     if (!isValid) return;

//     // Send reset password request
//     try {
//         const response = await fetch(`http://localhost:5000/reset-password/${token}`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ newPassword: passwordValue })
//         });

//         const result = await response.text();
//         alert(result); // Show response message

//     } catch (error) {
//         console.error("Error:", error);
//         alert("Something went wrong. Check the console for details.");
//     }
// });

// // Helper functions for error handling
// function setError(input, message) {
//     input.style.border = "solid red";
//     const errorText = input.nextElementSibling;
//     if (errorText) errorText.textContent = message;
// }

// function setSuccess(input) {
//     input.style.border = "solid green";
//     const errorText = input.nextElementSibling;
//     if (errorText) errorText.textContent = "";
// }

document.getElementById("resetPasswordForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent default form submission
    
    const password = document.getElementById("newPassword");
    const confirmPassword = document.getElementById("confirmPassword"); // Ensure this input exists in HTML
    const passwordValue = password.value.trim();
    const confirmPasswordValue = confirmPassword.value.trim();
    const token = window.location.pathname.split("/").pop(); // Extract token from URL
    
    // Helper functions for error handling
    const setError = (element, message) => {
        const inputControl = element.parentElement;
        const errorDisplay = inputControl.querySelector('.error');
    
        errorDisplay.innerText = message;
        inputControl.classList.add('error');
        inputControl.classList.remove('success');
    }
    
    const setSuccess = (element) => {
        const inputControl = element.parentElement;
        const errorDisplay = inputControl.querySelector('.error');
    
        errorDisplay.innerText = '';  // Clear error message
        inputControl.classList.add('success');
        inputControl.classList.remove('error');
    };

    // Check if the token is valid BEFORE checking password validation
    try {
        const tokenCheckResponse = await fetch(`http://localhost:5000/check-token/${token}`);
        const tokenCheckResult = await tokenCheckResponse.json();

        if (!tokenCheckResponse.ok) {
            alert(tokenCheckResult.message); // Show token expiry message
            return; // Stop further execution
        }
    } catch (error) {
        console.error("Error checking token:", error);
        alert("Something went wrong. Please try again.");
        return;
    }

    // If token is valid, proceed to check password validation
    const validateInputs = () => {
        let isValid = true;  // Make sure `isValid` is defined here
        
        if (passwordValue === '') {
            setError(password, 'Password is required');
            isValid = false;
        } else if (passwordValue.length < 8) {
            setError(password, 'Password must be at least 8 characters.');
            isValid = false;
        } else {
            setSuccess(password);
        }

        if (confirmPasswordValue === '') {
            setError(confirmPassword, 'Please confirm your password');
            isValid = false;
        } else if (confirmPasswordValue !== passwordValue) {
            setError(confirmPassword, "Passwords don't match");
            isValid = false;
        } else {
            setSuccess(confirmPassword);
        }

        return isValid;  // Return the validation result
    }

    // Perform the validation check
    const isValid = validateInputs();  // Call the function to validate

    // If validation fails, do not send the request
    if (!isValid) return;

    // Send reset password request
    try {
        const response = await fetch(`http://localhost:5000/reset-password/${token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newPassword: passwordValue })
        });

        const result = await response.text();
        alert(result); // Show response message

    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong. Check the console for details.");
    }
});

