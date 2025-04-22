import { authMiddleware } from "../auth-middleware"

/**
 * API endpoint to get user points
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

  // Return user points
  return res.status(200).json({
    points: req.user.points || 0,
    success: true,
  })
}
