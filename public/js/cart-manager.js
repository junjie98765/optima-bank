class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem("voucherCart")) || [];
    }

    // Get userId (this assumes you handle authentication and have userId available)
    getUserId() {
        // This should return the userId for the authenticated user
        return window.currentUser ? window.currentUser.id : 'guest_' + Math.random().toString(36).substring(2, 15);
    }

    // Add item to the cart
    async addItem(item) {
        const existingItemIndex = this.cart.findIndex((cartItem) => cartItem.id === item.id);

        if (existingItemIndex !== -1) {
            // Update quantity if voucher already exists
            this.cart[existingItemIndex].quantity += item.quantity;
        } else {
            // Add new voucher to cart
            this.cart.push(item);
        }

        // Save updated cart to localStorage immediately
        localStorage.setItem("voucherCart", JSON.stringify(this.cart));

        // Get userId to ensure cart is saved for the correct user
        const userId = this.getUserId();

        // Try to save to the backend (asynchronously)
        await this.saveCart(userId).catch((error) => {
            console.error("Background save to database failed:", error);
        });
    }

    // Save cart to the database
    async saveCart(userId) {
        try {
            console.log("Saving cart to database for user:", userId);
            console.log("Cart data being sent:", this.cart);
    
            const response = await fetch(`/api/cart/${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cart: this.cart }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to save cart');
            }
    
            const result = await response.json();
            console.log('Cart saved successfully:', result);
        } catch (error) {
            console.error("Error saving cart to database:", error);
        }
    }
    

    // Get the current cart
    getCart() {
        return this.cart;
    }
}

// Initialize the cart manager
window.cartManager = new CartManager();
