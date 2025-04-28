const form = document.getElementById('form'); // Ensure the form has the correct ID
const username = document.getElementById('username');
const email = document.getElementById('email');
const phonenumber = document.getElementById('phonenumber');
const password = document.getElementById('password');
const password2 = document.getElementById('password2');

form.addEventListener('submit', e => {
    e.preventDefault(); // Prevent the default form submission
    validateInputs();
});


const setError = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success')
}

const setSuccess = element => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = '';
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
};

const isValidEmail = email => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Phone number validation regex (You can adjust this regex based on your country format)
const isValidPhoneNumber = phone => {
    const re = /^[+]?[0-9]{10,15}$/; // Adjust the regex to match your phone number format
    return re.test(String(phone).trim());
};


const validateInputs = () =>{
    let isValid = true;

    const usernameValue = username.value.trim();
    const emailValue = email.value.trim();
    const phoneValue = phonenumber.value.trim();
    const passwordValue = password.value.trim();
    const password2Value = password2.value.trim();


    if(usernameValue === '') {
        setError(username, 'Username is required');
        isValid = false;
    } else {
        setSuccess(username);
    }

    if(emailValue === '') {
        setError(email, 'Email is required');
        isValid = false;
    } else if (!isValidEmail(emailValue)) {
        setError(email, 'Provide a valid email address');
        isValid = false;
    } else {
        setSuccess(email);
    }

    if(phoneValue === '') {
        setError(phonenumber, 'Phone number is required');
        isValid = false;
    } else if (!isValidPhoneNumber(phoneValue)) {
        setError(phonenumber, 'Enter a valid phone number');
        isValid = false;
    } else {
        setSuccess(phonenumber);
    }


    if(passwordValue === '') {
        setError(password, 'Password is required');
        isValid = false;
    } else if (passwordValue.length < 8 ) {
        setError(password, 'Password must be at least 8 character.');
        isValid = false;
    } else {
        setSuccess(password);
    }

    if(password2Value === '') {
        setError(password2, 'Please confirm your password');
        isValid = false;
    } else if (password2Value !== passwordValue) {
        setError(password2, "Passwords doesn't match");
        isValid = false;
    } else {
        setSuccess(password2);
    }

  if (isValid == true) {
        const userData = {
            username: usernameValue,
            email: emailValue,
            phone: phoneValue,
            password: passwordValue
        };
  
      
        // Send data to the backend API (POST request)
    //     fetch('http://localhost:5000/register', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify(userData)
    //     })
    //     .then(response => response.text())
    //     .then(data => alert(data))  // Show success message
    //     .catch(error => alert('Error: ' + error));  // Show error message
    // } else {
    //     alert("Please fill out all fields.");
  
    // }
    
// };

fetch('http://127.0.0.1:5000/register', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        username: usernameValue, // FIXED
        email: emailValue,       // FIXED
        phone: phoneValue,       // FIXED
        password: passwordValue  // FIXED
    })
})
.then(response => response.text())  // Expect text response instead of JSON
.then(data => {
    if (data.includes("exists")) {  // If backend returns "Username or Email already exists"
        alert("User already exist");
    } else {
        alert("Registration successful");
    }
})
.catch(err => console.error('Error:', err));
}}