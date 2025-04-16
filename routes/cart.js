const express = require("express")
const router = express.Router()
const { authenticate } = require("../middleware/auth")
const Voucher = require("../models/voucher")

// Get user's cart
router.get("/", authenticate, async (req, res) => {
  try {
    // Populate cart with voucher details
    await req.user.populate("cart.voucherId")

    // Format cart items
    const cartItems = req.user.cart.map((item) => ({
      id: item.voucherId._id,
      name: item.voucherId.name,
      points: item.voucherId.points,
      quantity: item.quantity,
      description: item.voucherId.description,
      validity: item.voucherId.validity,
      terms: item.voucherId.terms,
      iconClass: item.voucherId.iconClass,
    }))

    res.json(cartItems)
  } catch (error) {
    console.error("Get cart error:", error)
    res.status(500).json({ error: "Error fetching cart" })
  }
})

// Add item to cart
router.post("/add", authenticate, async (req, res) => {
  try {
    const { voucherId, quantity } = req.body

    // Validate voucher exists
    const voucher = await Voucher.findById(voucherId)
    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" })
    }

    // Add to cart
    await req.user.addToCart(voucherId, Number.parseInt(quantity) || 1)

    res.json({ success: true, message: "Item added to cart" })
  } catch (error) {
    console.error("Add to cart error:", error)
    res.status(500).json({ error: "Error adding to cart" })
  }
})

// Remove item from cart
router.post("/remove", authenticate, async (req, res) => {
  try {
    const { voucherId } = req.body

    // Remove from cart
    await req.user.removeFromCart(voucherId)

    res.json({ success: true, message: "Item removed from cart" })
  } catch (error) {
    console.error("Remove from cart error:", error)
    res.status(500).json({ error: "Error removing from cart" })
  }
})

// Update item quantity
router.post("/update", authenticate, async (req, res) => {
  try {
    const { voucherId, quantity } = req.body

    // Find item in cart
    const cartItem = req.user.cart.find((item) => item.voucherId.toString() === voucherId)

    if (!cartItem) {
      return res.status(404).json({ error: "Item not in cart" })
    }

    // Update quantity
    cartItem.quantity = Number.parseInt(quantity)
    await req.user.save()

    res.json({ success: true, message: "Cart updated" })
  } catch (error) {
    console.error("Update cart error:", error)
    res.status(500).json({ error: "Error updating cart" })
  }
})

// Clear cart
router.post("/clear", authenticate, async (req, res) => {
  try {
    await req.user.clearCart()
    res.json({ success: true, message: "Cart cleared" })
  } catch (error) {
    console.error("Clear cart error:", error)
    res.status(500).json({ error: "Error clearing cart" })
  }
})

// Checkout
router.post("/checkout", authenticate, async (req, res) => {
  try {
    // Populate cart with voucher details
    await req.user.populate("cart.voucherId")

    // Calculate total points
    const totalPoints = req.user.cart.reduce((total, item) => total + item.voucherId.points * item.quantity, 0)

    // Check if user has enough points
    if (req.user.points < totalPoints) {
      return res.status(400).json({
        error: "Not enough points",
        required: totalPoints,
        available: req.user.points,
      })
    }

    // Process redemption
    const redeemed = req.user.cart.map((item) => ({
      voucherId: item.voucherId._id,
      quantity: item.quantity,
      code: generateVoucherCode(),
    }))

    // Update user
    req.user.redeemed.push(...redeemed)
    req.user.points -= totalPoints
    req.user.cart = []
    await req.user.save()

    res.json({
      success: true,
      message: "Checkout successful",
      redeemed,
      remainingPoints: req.user.points,
    })
  } catch (error) {
    console.error("Checkout error:", error)
    res.status(500).json({ error: "Error processing checkout" })
  }
})

// Helper function to generate voucher code
function generateVoucherCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

module.exports = router
