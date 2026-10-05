const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { User } = require('../models');

/**
 * Member 3 does not issue JWTs — that's Member 1's auth module. This
 * middleware only verifies tokens against the shared JWT_SECRET so that
 * core backend APIs stay protected and compatible with Member 1's login
 * flow (ARCHITECTURE.md section 9: authenticate / authorize / requireRole).
 *
 * Expected token payload (shared contract with Member 1): { id, role }
 */
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw AppError.unauthorized('Missing or malformed Authorization header');
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw AppError.unauthorized('Invalid or expired token');
    }

    const user = await User.findByPk(payload.id);
    if (!user) {
      throw AppError.unauthorized('User no longer exists');
    }
    if (user.status !== 'ACTIVE') {
      throw AppError.forbidden('Account is not active');
    }

    // Never trust a role claimed only by the frontend/body — always the
    // authoritative DB row's role, even if the token also carries one.
    req.user = { id: user.id, role: user.role, email: user.email, name: user.name };
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * requireRole(...roles) — explicit, non-hierarchical role gate
 * (ARCHITECTURE.md section 9: "Role hierarchy is not automatically
 * hierarchical; access is explicit by role and resource.")
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(AppError.unauthorized());
  }
  if (!roles.includes(req.user.role)) {
    return next(AppError.forbidden('You do not have permission to perform this action'));
  }
  next();
};

// Alias kept for readability at call sites that check resource-level rules
// (e.g. "authorize a shopkeeper against their assigned food court") rather
// than a plain role check. Resource-level checks live in the services.
const authorize = requireRole;

module.exports = { authenticate, requireRole, authorize };
