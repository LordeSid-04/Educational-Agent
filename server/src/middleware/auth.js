import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'chalkmind-dev-secret-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

/**
 * Authentication Middleware — JWT-based session management.
 *
 * Two modes:
 *  - requireAuth: blocks unauthenticated requests (401)
 *  - optionalAuth: attaches user if token present, proceeds without if not
 *
 * Token format: Bearer <jwt>
 * Payload: { userId: number, username: string }
 */

/**
 * Generate a JWT for a user.
 */
export function generateToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * Verify and decode a JWT.
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Extract token from Authorization header.
 */
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

/**
 * Middleware: Require authentication.
 * Blocks request with 401 if no valid token.
 */
export function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware: Optional authentication.
 * Attaches user if token present; proceeds without if not.
 * Use for endpoints that work for both guests and authenticated users.
 */
export function optionalAuth(req, res, next) {
  const token = extractToken(req);
  req.guestId = null;

  const getAndValidateGuestId = () => {
    const guestId = req.headers['x-guest-id'];
    if (guestId) {
      // Validate guest ID format to prevent session hijacking or brute-force
      if (typeof guestId !== 'string' || !/^guest_[a-z0-9]{10,50}$/i.test(guestId)) {
        return { valid: false, error: 'Invalid Guest ID format' };
      }
      return { valid: true, guestId };
    }
    return { valid: true, guestId: null };
  };

  if (!token) {
    req.user = null;
    const result = getAndValidateGuestId();
    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }
    req.guestId = result.guestId;
    return next();
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
  } catch {
    req.user = null;
    const result = getAndValidateGuestId();
    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }
    req.guestId = result.guestId;
  }
  next();
}

