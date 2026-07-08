// middleware/authMiddleware.js
// This middleware PROTECTS routes that require authentication.
//
// How middleware works in Express:
//   Request → Middleware → Route Handler → Response
//
// If the JWT is valid, the middleware calls next() to pass control
// to the actual route handler. If not, it returns an error immediately.

const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Authentication Middleware
 *
 * Checks for a valid JWT in the 'Authorization' request header.
 * The header format expected is: Authorization: Bearer <token>
 *
 * If valid: attaches the user object to req.user and calls next()
 * If invalid: returns a 401 Unauthorized error
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if the Authorization header exists and starts with "Bearer"
    // Example header: "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR..."
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extract the token part (everything after "Bearer ")
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token was found, deny access
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided. Please log in.'
      });
    }

    // Verify the token using our JWT utility
    // This will throw an error if the token is expired or tampered with
    const decoded = verifyToken(token);

    // Find the user in the database using the ID stored in the token payload
    // We exclude the password from the result for security
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    // If the user no longer exists (e.g., was deleted), deny access
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user no longer exists.'
      });
    }

    // Attach the user to the request object so route handlers can access it
    // Example: req.user.id gives us the authenticated user's ID
    req.user = user;

    // Call next() to pass control to the next middleware or route handler
    next();

  } catch (error) {
    // jwt.verify() throws specific errors:
    // - JsonWebTokenError: token is malformed or signature is invalid
    // - TokenExpiredError: token has expired
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

module.exports = { protect };
