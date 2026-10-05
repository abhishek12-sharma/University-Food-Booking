const { validationResult } = require('express-validator');
const { error: errorResponse } = require('../utils/response');

// Runs after an express-validator chain; turns accumulated errors into the
// standard error envelope (422 Validation failure, API_CONTRACT.md section 6).
function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return errorResponse(res, {
      message: 'Validation failed',
      errors: result.array().map((e) => ({ field: e.path, message: e.msg })),
      statusCode: 422,
    });
  }
  next();
}

module.exports = validate;
