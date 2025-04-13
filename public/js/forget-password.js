document.getElementById("resetPasswordForm").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent form from reloading the page

    const email = document.getElementById("email").value;

    try {
        const response = await fetch("http://localhost:5000/forget-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await response.text();
        alert(data); // Show success or error message
    } catch (error) {
        console.error("❌ Error:", error);
        alert("Error sending reset link.");
    }
});
