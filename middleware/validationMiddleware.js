// middleware/validationMiddleware.js
// Input validation middleware to check incoming request data BEFORE
// it reaches the controller. This keeps controllers clean.
//
// Why validate here?
//   - Separation of concerns: validation logic is centralized
//   - Early rejection of bad data (before hitting the database)
//   - Reusable: the same validator can be used on multiple routes

/**
 * Validates registration input.
 * Checks: username, email format, and password length.
 */
const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  // Check username
  if (!username || username.trim().length < 2) {
    errors.push('Username must be at least 2 characters long.');
  }
  if (username && username.trim().length > 50) {
    errors.push('Username must be at most 50 characters long.');
  }

  // Check email
  if (!email || !email.trim()) {
    errors.push('Email is required.');
  } else {
    // Simple email format check using a regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Please provide a valid email address.');
    }
  }

  // Check password
  if (!password || password.length < 4) {
    errors.push('Password must be at least 4 characters long.');
  }

  // If there are any errors, return a 400 Bad Request with all error messages
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: errors
    });
  }

  // No errors → pass control to the controller
  next();
};

/**
 * Validates login input.
 * Checks: email and password presence.
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !email.trim()) {
    errors.push('Email is required.');
  }

  if (!password || !password.trim()) {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: errors
    });
  }

  next();
};

/**
 * Validates item (note) creation and update input.
 * Checks: title is present and within length limits.
 */
const validateItem = (req, res, next) => {
  const { title, description } = req.body;
  const errors = [];

  // Title is required
  if (!title || title.trim().length === 0) {
    errors.push('Title is required.');
  }
  if (title && title.trim().length > 200) {
    errors.push('Title must be at most 200 characters long.');
  }

  // Description is optional, but if provided, check its length
  if (description && description.length > 5000) {
    errors.push('Description must be at most 5000 characters long.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: errors
    });
  }

  next();
};

module.exports = { validateRegister, validateLogin, validateItem };
