/**
 * Central error-handling middleware. Must be registered LAST, after the router.
 * Services/controllers throw; this is the single place that shapes error responses.
 */
import { ZodError } from "zod";
import { AppError } from "#utils/errors.js";

// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity (4 args).
export function errorHandler(err, req, res, next) {
  // Validation errors from Zod's `.parse()`.
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.flatten().fieldErrors,
    });
  }

  // Known, typed application errors.
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details && { errors: err.details }),
    });
  }

  // Anything else is unexpected.
  console.error("Unhandled error:", err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
