/**
 * Typed application errors.
 * Services throw these instead of writing to `res`; the central error handler
 * (middlewares/errorHandler.js) maps them to HTTP status codes.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, details = undefined) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details) {
    super(message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details) {
    super(message, 401, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details) {
    super(message, 403, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found", details) {
    super(message, 404, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", details) {
    super(message, 409, details);
  }
}
