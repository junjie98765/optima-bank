import { authMiddleware } from "../../auth-middleware";

/**
 * API endpoint to get user points
 */
export default async function handler(req, res) {
  try {
    // Apply auth middleware
    await new Promise((resolve) => {
      authMiddleware(req, res, resolve);
    });

    // Check if user is authenticated
    if (!req.user) {
      console.error("User not authenticated");
      return res.status(401).json({ error: "Unauthorized", success: false });
    }

    // Log user data for debugging
    console.log("User data:", {
      id: req.user.id,
      points: req.user.points,
      authenticated: !!req.user
    });

    // Return user points
    return res.status(200).json({
      points: req.user.points || 0,
      success: true,
    });
  } catch (error) {
    console.error("Error in points API:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      success: false
    });
  }
}