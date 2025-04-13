// // Function to filter vouchers based on category selection
// function filterVouchers(category) {
//     const allVouchers = document.querySelectorAll('.voucher-item');

//     allVouchers.forEach(function(voucher) {
//         if (category === 'all') {
//             voucher.style.display = 'block'; // Show all vouchers when "All Categories" is clicked
//         } else if (voucher.dataset.category === category) {
//             voucher.style.display = 'block'; // Show only vouchers in the selected category
//         } else {
//             voucher.style.display = 'none'; // Hide vouchers that don't match the selected category
//         }
//     });
// }

// // Function to search for coupons based on input text
// function searchCoupons() {
//     const searchTerm = document.getElementById('couponSearch').value.toLowerCase();
//     const allVouchers = document.querySelectorAll('.voucher-item');

//     allVouchers.forEach(function(voucher) {
//         const voucherName = voucher.querySelector('p').textContent.toLowerCase();
//         if (voucherName.indexOf(searchTerm) !== -1) {
//             voucher.style.display = 'block'; // Show voucher if the name matches the search term
//         } else {
//             voucher.style.display = 'none'; // Hide voucher if the name doesn't match
//         }
//     });
// }

// Function to filter vouchers based on category selection
function filterVouchers(category) {
    const allVouchers = document.querySelectorAll('.voucher-item');

    allVouchers.forEach(function(voucher) {
        if (category === 'all') {
            voucher.style.display = 'block'; // Show all vouchers when "All Categories" is clicked
        } else if (voucher.dataset.category === category) {
            voucher.style.display = 'block'; // Show only vouchers in the selected category
        } else {
            voucher.style.display = 'none'; // Hide vouchers that don't match the selected category
        }
    });
}

// Function to search for coupons based on input text
function searchCoupons() {
    const searchTerm = document.getElementById('couponSearch').value.toLowerCase();
    const allVouchers = document.querySelectorAll('.voucher-item');

    allVouchers.forEach(function(voucher) {
        const voucherName = voucher.querySelector('p').textContent.toLowerCase();
        if (voucherName.indexOf(searchTerm) !== -1) {
            voucher.style.display = 'block'; // Show voucher if the name matches the search term
        } else {
            voucher.style.display = 'none'; // Hide voucher if the name doesn't match
        }
    });
}

// Function to add a voucher to the cart
function addToCart(voucherName, voucherPoints) {
    const cart = JSON.parse(localStorage.getItem('voucherCart')) || []; // Retrieve existing cart from localStorage

    // Check if the voucher is already in the cart
    if (cart.find(item => item.name === voucherName)) {
        alert(`${voucherName} is already in your cart.`);
        return;
    }

    // Add voucher to cart
    cart.push({ name: voucherName, points: voucherPoints });

    // Save updated cart to localStorage
    localStorage.setItem('voucherCart', JSON.stringify(cart));

    // Disable the "Add to Cart" button and update its text
    const cartButton = document.querySelector(`#${voucherName.replace(/\s+/g, '')} .cart-btn`);
    cartButton.disabled = true;
    cartButton.textContent = 'Added to Cart';
    alert(`${voucherName} has been added to your cart.`);
}

// Function to go to the cart page
function goToCart() {
    window.location.href = '/cart'; // Navigate to the cart page
}