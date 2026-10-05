/**
 * Standard response envelope, as mandated by API_CONTRACT.md section 5.
 * All controllers must respond through these helpers so the shape never drifts.
 */

function success(res, { message = 'Operation successful', data = {} } = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function error(res, { message = 'An error occurred', errors = [], statusCode = 400 } = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

module.exports = { success, error };
