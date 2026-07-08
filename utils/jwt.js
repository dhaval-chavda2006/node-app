// utils/jwt.js
// Utility functions for creating and verifying JSON Web Tokens (JWT).
//
// What is a JWT?
// A JWT is a compact, URL-safe token that encodes information (called "claims").
// It has three parts: Header.Payload.Signature
//   - Header: algorithm used (e.g., HS256)
//   - Payload: the data (e.g., user id)
//   - Signature: proves the token hasn't been tampered with
//
// Flow:
//   1. User logs in → server generates a JWT with user's id
//   2. Client stores JWT in localStorage
//   3. Client sends JWT in every request header: Authorization: Bearer <token>
//   4. Server verifies the token before allowing access to protected routes

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Generates a JWT token for a given user ID.
 * @param {number} userId - The user's database ID
 * @returns {string} - A signed JWT token string
 */
const generateToken = (userId) => {
  // jwt.sign(payload, secret, options)
  // payload: the data to encode (we store the user's id)
  // secret: a private key to sign the token (from .env)
  // expiresIn: how long until the token expires (e.g., "24h")
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

/**
 * Verifies a JWT token and returns the decoded payload.
 * Throws an error if the token is invalid or expired.
 * @param {string} token - The JWT token string to verify
 * @returns {object} - The decoded payload (e.g., { id: 1, iat: ..., exp: ... })
 */
const verifyToken = (token) => {
  // jwt.verify() will throw if the token is invalid or expired
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
