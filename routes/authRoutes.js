// routes/authRoutes.js
// Defines the URL routes for authentication endpoints.
//
// Express Router allows us to group related routes together.
// This router is then mounted in app.js at '/api/auth', so:
//   router.post('/register') → becomes → POST /api/auth/register
//   router.post('/login')    → becomes → POST /api/auth/login

const express = require('express');
const router = express.Router();

// Import controller functions
const { register, login, getMe } = require('../controllers/authController');

// Import validation middleware
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');

// Import auth middleware (to protect the /me route)
const { protect } = require('../middleware/authMiddleware');

// --- Route Definitions ---
// Each route has: HTTP Method + Path + [Middleware...] + Controller

// POST /api/auth/register
// Flow: validateRegister → register controller
router.post('/register', validateRegister, register);

// POST /api/auth/login
// Flow: validateLogin → login controller
router.post('/login', validateLogin, login);

// GET /api/auth/me
// Flow: protect (verify JWT) → getMe controller
// This is a protected route — only logged-in users can access it
router.get('/me', protect, getMe);

module.exports = router;
