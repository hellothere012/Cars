// backend/shared/response.js
// Purpose: Provides standardized HTTP response formatting for Lambda functions.
// TODO: Implement utility functions for generating consistent API Gateway responses.

/**
 * Formats a success response.
 * @param {Object} body The response body.
 * @param {number} statusCode HTTP status code (default is 200).
 * @returns {Object} API Gateway compatible response object.
 */
const success = (body, statusCode = 200) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // Adjust as needed for CORS
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(body || {}),
  };
};

/**
 * Formats an error response.
 * @param {string} message Error message.
 * @param {number} statusCode HTTP status code for the error.
 * @param {Object|Array} errors Optional additional error details.
 * @returns {Object} API Gateway compatible response object.
 */
const error = (message, statusCode, errors = undefined) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // Adjust as needed for CORS
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      message,
      ...(errors && { errors }), // Include errors if provided
    }),
  };
};

/**
 * Shortcut for a 400 Bad Request error.
 * @param {string} message Error message.
 * @param {Object|Array} errors Optional additional error details.
 */
const badRequest = (message, errors = undefined) => error(message, 400, errors);

/**
 * Shortcut for a 401 Unauthorized error.
 * @param {string} message Error message.
 */
const unauthorized = (message = 'Unauthorized') => error(message, 401);

/**
 * Shortcut for a 403 Forbidden error.
 * @param {string} message Error message.
 */
const forbidden = (message = 'Forbidden') => error(message, 403);

/**
 * Shortcut for a 404 Not Found error.
 * @param {string} message Error message.
 */
const notFound = (message = 'Resource not found') => error(message, 404);

/**
 * Shortcut for a 500 Internal Server Error.
 * @param {string} message Error message.
 */
const internalServerError = (message = 'Internal server error') => error(message, 500);


module.exports = {
  success,
  error,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  internalServerError,
};
