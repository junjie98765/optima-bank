// This script tests the points API endpoints
// Run this after starting your server

async function testPointsAPI() {
    console.log("Testing Points API Endpoints...")
  
    try {
      // Test GET /api/points
      console.log("\n1. Testing GET /api/points")
      const getPointsResponse = await fetch("http://localhost:5000/api/points", {
        credentials: "include", // Important: Include cookies for authentication
      })
  
      console.log(`Status: ${getPointsResponse.status} ${getPointsResponse.statusText}`)
  
      if (!getPointsResponse.ok) {
        const text = await getPointsResponse.text()
        console.log("Error response:", text)
        throw new Error(`Failed to fetch points: ${getPointsResponse.status} ${getPointsResponse.statusText}`)
      }
  
      const pointsData = await getPointsResponse.json()
      console.log(`Success! User has ${pointsData.points} points`)
  
      // Test POST /api/points/update
      console.log("\n2. Testing POST /api/points/update")
      const updatePointsResponse = await fetch("http://localhost:5000/api/points/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: Include cookies for authentication
        body: JSON.stringify({
          points: 10,
          operation: "add",
        }),
      })
  
      console.log(`Status: ${updatePointsResponse.status} ${updatePointsResponse.statusText}`)
  
      if (!updatePointsResponse.ok) {
        const text = await updatePointsResponse.text()
        console.log("Error response:", text)
        throw new Error(`Failed to update points: ${updatePointsResponse.status} ${updatePointsResponse.statusText}`)
      }
  
      const updateResult = await updatePointsResponse.json()
      console.log(`Success! Points updated. New total: ${updateResult.points}`)
  
      // Test GET /api/points/debug
      console.log("\n3. Testing GET /api/points/debug")
      const debugResponse = await fetch("http://localhost:5000/api/points/debug", {
        credentials: "include", // Important: Include cookies for authentication
      })
  
      console.log(`Status: ${debugResponse.status} ${debugResponse.statusText}`)
  
      if (!debugResponse.ok) {
        const text = await debugResponse.text()
        console.log("Error response:", text)
        throw new Error(`Failed to get debug info: ${debugResponse.status} ${debugResponse.statusText}`)
      }
  
      const debugData = await debugResponse.json()
      console.log("User debug data:", debugData)
  
      console.log("\nAll tests completed!")
    } catch (error) {
      console.error("API Test Error:", error.message)
    }
  }
  
  testPointsAPI()
  