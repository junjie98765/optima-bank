import { authMiddleware } from "../../auth-middleware"

/**
 * API endpoint to get user profile
 */
export default async function handler(req, res) {
  // Apply auth middleware
  await new Promise((resolve) => {
    authMiddleware(req, res, resolve)
  })

  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  // Return mock user profile data
  // In a real app, this would fetch the user's profile from a database
  return res.status(200).json({
    id: req.user.id,
    name: "John Doe",
    username: "johndoe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    memberSince: "January 15, 2023",
    points: req.user.points || 0
  })
}
