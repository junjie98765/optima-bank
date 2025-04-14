// This script tests the voucher API endpoints
// Run this after starting your server

async function testVoucherAPI() {
    console.log("Testing Voucher API Endpoints...")
  
    try {
      // Test GET /api/vouchers
      console.log("\n1. Testing GET /api/vouchers")
      const getAllResponse = await fetch("http://localhost:5000/api/vouchers")
  
      if (!getAllResponse.ok) {
        throw new Error(`Failed to fetch vouchers: ${getAllResponse.status} ${getAllResponse.statusText}`)
      }
  
      const vouchers = await getAllResponse.json()
      console.log(`Success! Retrieved ${vouchers.length} vouchers`)
  
      if (vouchers.length > 0) {
        // Test GET /api/vouchers/:id with the first voucher
        const firstVoucherId = vouchers[0]._id
        console.log(`\n2. Testing GET /api/vouchers/${firstVoucherId}`)
  
        const getOneResponse = await fetch(`http://localhost:5000/api/vouchers/${firstVoucherId}`)
  
        if (!getOneResponse.ok) {
          throw new Error(`Failed to fetch voucher by ID: ${getOneResponse.status} ${getOneResponse.statusText}`)
        }
  
        const voucher = await getOneResponse.json()
        console.log(`Success! Retrieved voucher: ${voucher.name}`)
      }
  
      // Test the database connection endpoint
      console.log("\n3. Testing GET /api/vouchers/test")
      const testResponse = await fetch("http://localhost:5000/api/vouchers/test")
  
      if (!testResponse.ok) {
        throw new Error(`Failed to test database connection: ${testResponse.status} ${testResponse.statusText}`)
      }
  
      const testResult = await testResponse.json()
      console.log(
        "Database connection test result:",
        testResult.success ? "SUCCESS" : "FAILED",
        `(${testResult.database.connection.status})`,
      )
  
      console.log("\nAll tests completed successfully!")
    } catch (error) {
      console.error("API Test Error:", error.message)
    }
  }
  
  testVoucherAPI()
  