// Test script for cart database operations
const CartDatabase = require("./cart-db")

async function testCartOperations() {
  const cartDb = new CartDatabase()

  try {
    // Generate a test user ID
    const testUserId = "test-user-" + Date.now()
    console.log(`Testing with user ID: ${testUserId}`)

    // Test saving a cart
    console.log("1. Testing saveUserCart...")
    const testItems = [
      {
        id: "test-voucher-1",
        name: "Test Voucher 1",
        points: 100,
        quantity: 1,
        description: "Test description 1",
        validity: "2023-12-31",
      },
      {
        id: "test-voucher-2",
        name: "Test Voucher 2",
        points: 200,
        quantity: 2,
        description: "Test description 2",
        validity: "2023-12-31",
      },
    ]

    const saveResult = await cartDb.saveUserCart(testUserId, testItems)
    console.log("Save result:", saveResult)

    // Test getting a cart
    console.log("\n2. Testing getUserCart...")
    const userCart = await cartDb.getUserCart(testUserId)
    console.log("User cart:", userCart)

    // Test updating a cart
    console.log("\n3. Testing cart update...")
    const updatedItems = [
      ...testItems,
      {
        id: "test-voucher-3",
        name: "Test Voucher 3",
        points: 300,
        quantity: 3,
        description: "Test description 3",
        validity: "2023-12-31",
      },
    ]

    const updateResult = await cartDb.saveUserCart(testUserId, updatedItems)
    console.log("Update result:", updateResult)

    // Verify the update
    const updatedCart = await cartDb.getUserCart(testUserId)
    console.log("Updated cart:", updatedCart)

    // Test clearing a cart
    console.log("\n4. Testing clearUserCart...")
    const clearResult = await cartDb.clearUserCart(testUserId)
    console.log("Clear result:", clearResult)

    // Verify the cart is cleared
    const clearedCart = await cartDb.getUserCart(testUserId)
    console.log("Cleared cart:", clearedCart)

    console.log("\nAll tests completed successfully!")
  } catch (error) {
    console.error("Test failed:", error)
  } finally {
    await cartDb.close()
  }
}

// Run the tests
testCartOperations()
