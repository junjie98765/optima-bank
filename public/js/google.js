// function handleCredentialResponse(response) {
//     // This function will be triggered when the user successfully signs in.
//     const id_token = response.credential;

//     // Send the ID token to your server for validation
//     fetch('http://localhost:5000/auth/google/callback', { 
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ token: id_token }),
//     })
    
//     .then(response => response.json())
//     .then(data => {
//         if (data.success) {
//             // Handle success - redirect to home page or dashboard
//             window.location.href = 'homepage.html';  // Or your redirect URL
//         } else {
//             // Handle error
//             alert('Error: ' + data.message);
//         }
//     })
//     .catch(err => console.error('Error:', err));
// }

// // Initialize the Google Sign-In button
// window.onload = function () {
//     google.accounts.id.initialize({
//         client_id: '262201707875-fsd8diveqkc8taqvikf7sd5n6u05hu16.apps.googleusercontent.com',  // Your Google Client ID
//         callback: handleCredentialResponse,
//     });
//     google.accounts.id.renderButton(
//         document.getElementById("google-signin-button"),
//         { theme: "outline", size: "large" }
//     );
// };
function handleCredentialResponse(response) {
    // This function will be triggered when the user successfully signs in.
    const id_token = response.credential;

    // Send the ID token to your server for validation
    fetch('http://localhost:5000/auth/google/callback', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: id_token }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Handle success - redirect to home page or dashboard
            window.location.href = 'homepage.html';  // Or your redirect URL
        } else {
            // Handle error
            alert('Error: ' + data.message);
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('An error occurred. Please try again.');
    });
}

// Initialize the Google Sign-In button
window.onload = function () {
    google.accounts.id.initialize({
        client_id: '262201707875-fsd8diveqkc8taqvikf7sd5n6u05hu16.apps.googleusercontent.com',  // Your Google Client ID
        callback: handleCredentialResponse,
    });
    google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        { theme: "outline", size: "large" }
    );
};
