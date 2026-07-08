// controllers/authController.js
// Handles user registration and login logic.
//
// What is a Controller?
//   A controller receives the request (from routes), processes business logic
//   (talking to the database, generating tokens), and sends back a response.
//
// MVC Pattern:
//   Model  → defines the data structure (User.js)
//   View   → the HTML pages (login.html, register.html)
//   Controller → handles the logic between Model and View (this file)

const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public (no token required)
 *
 * Request body: { username, email, password }
 * Response: { success, message, token, user }
 */
const register = async (req, res) => {
  try {
    // Extract fields from the request body
    // req.body is populated by express.json() middleware
    const { username, email, password } = req.body;

    // Check if a user with this email already exists
    // User.findOne() returns null if no record is found
    const existingUser = await User.findOne({ where: { email: email.toLowerCase().trim() } });

    if (existingUser) {
      // 409 Conflict: the resource (email) already exists
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists. Please use a different email or login.'
      });
    }

    // Create the new user record in the database.
    // The 'beforeCreate' hook in User.js will automatically hash the password
    // BEFORE it gets saved to the database.
    const newUser = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: password   // This gets hashed by the beforeCreate hook
    });

    // Generate a JWT token for the newly registered user
    // This allows the user to be "auto-logged in" after registration
    const token = generateToken(newUser.id);

    // Send a 201 Created response with the token and user info
    // We NEVER send back the password, even the hashed version
    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome.',
      token: token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Handle Sequelize validation errors (e.g., unique constraint violations)
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error.',
        errors: messages
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.'
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT
 * @access  Public
 *
 * Request body: { email, password }
 * Response: { success, message, token, user }
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email (case-insensitive)
    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() }
    });

    // If no user found with that email
    if (!user) {
      // Security note: we give a generic message intentionally.
      // Saying "email not found" could help attackers enumerate valid emails.
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Compare the provided password with the stored hash
    // user.comparePassword() is defined in User.js
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Credentials are valid → generate a JWT token
    const token = generateToken(user.id);

    return res.status(200).json({
      success: true,
      message: 'Login successful! Welcome back.',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.'
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get the currently authenticated user's info
 * @access  Protected (requires valid JWT)
 *
 * This route is used by the frontend to check if the user is still logged in
 * and to get their profile information.
 */
const getMe = async (req, res) => {
  try {
    // req.user is set by the 'protect' middleware in authMiddleware.js
    // It contains the full user object (without password)
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user info.'
    });
  }
};

module.exports = { register, login, getMe };
