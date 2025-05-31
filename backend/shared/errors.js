// backend/shared/errors.js
// Purpose: Defines custom error classes for the application.
// TODO: Implement custom error types as needed.

class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details; // Can be an object or array of error details
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Input validation failed', details = null) {
    super(message, 400, details); // 400 Bad Request
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = null) {
    super(message, 404, details); // 404 Not Found
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details = null) {
    super(message, 401, details); // 401 Unauthorized
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details = null) {
    super(message, 403, details); // 403 Forbidden
  }
}

class DatabaseError extends AppError {
  constructor(message = 'A database error occurred', details = null, originalError = null) {
    super(message, 500, details); // 500 Internal Server Error
    this.originalError = originalError; // Store the original database error if available
  }
}

// Add more custom error classes as your application requires
// For example: KBBServiceError, OCRProcessingError, etc.

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  DatabaseError,
};
