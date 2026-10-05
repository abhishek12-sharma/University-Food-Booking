const { error: errorResponse } = require('../utils/response');

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  // Known, operational errors (AppError) carry their own status/message.
  if (err.isOperational) {
    return errorResponse(res, {
      message: err.message,
      errors: err.errors || [],
      statusCode: err.statusCode,
    });
  }

  // Sequelize validation / constraint errors -> 422
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return errorResponse(res, {
      message: 'Validation failed',
      errors: (err.errors || []).map((e) => ({ field: e.path, message: e.message })),
      statusCode: 422,
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return errorResponse(res, {
      message: 'Invalid reference to a related resource',
      errors: [],
      statusCode: 400,
    });
  }

  // Unexpected/programmer errors -> 500, never leak internals to the client.
  console.error('[UNHANDLED ERROR]', err);
  return errorResponse(res, {
    message: 'Internal server error',
    errors: [],
    statusCode: 500,
  });
}

function notFoundHandler(req, res) {
  return errorResponse(res, {
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    errors: [],
    statusCode: 404,
  });
}

module.exports = { errorHandler, notFoundHandler };
