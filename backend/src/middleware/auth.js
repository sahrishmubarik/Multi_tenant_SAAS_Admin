import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  try {
    // Authorization header get karo
    const authHeader = req?.headers?.authorization;

    // Check karo header exist karta hai ya nahi
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required",
      });
    }

    // Expected format:
    // Authorization: Bearer YOUR_TOKEN
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    // JWT verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Decoded user information request ke andar store karo
    req.user = decoded;

    // Request ko next middleware/controller ke paas bhejo
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}
