import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

export async function GET() {
  try {
    // Get user ID from session (you'll need to implement your auth logic here)
    // This is a placeholder - replace with your actual auth logic
    const userId = "current-user-id" // Replace with actual user ID from your auth system

    // Connect to database
    const db = await connectToDatabase()
    const usersCollection = db.collection("users")

    // Find the user
    const user = await usersCollection.findOne({ _id: userId })

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Return the user's points
    return NextResponse.json({
      success: true,
      points: user.points,
    })
  } catch (error) {
    console.error("Error fetching points:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
