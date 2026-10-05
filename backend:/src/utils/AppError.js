/**
 * Operational error carrying an HTTP status code and optional field-level
 * error list, so the global error handler can map it straight onto the
 * standard error envelope (API_CONTRACT.md section 5/6).
 */
class AppError extends Error {
  constructor(message, statusCode = 400, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errors = []) {
    return new AppError(message, 400, errors);
  }
  static unauthorized(message = 'Unauthenticated') {
    return new AppError(message, 401);
  }
  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403);
  }
  static notFound(message = 'Resource not found') {
    return new AppError(message, 404);
  }
  static conflict(message, errors = []) {
    return new AppError(message, 409, errors);
  }
  static unprocessable(message, errors = []) {
    return new AppError(message, 422, errors);
  }
  static tooManyRequests(message = 'Too many requests') {
    return new AppError(message, 429);
  }
  static internal(message = 'Internal server error') {
    return new AppError(message, 500);
  }
  static serviceUnavailable(message = 'Service unavailable') {
    return new AppError(message, 503);
  }
}

module.exports = AppError;
