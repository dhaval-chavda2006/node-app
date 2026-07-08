// app.js
// The main Express application setup file.
// This file configures all middleware and mounts the routes.
// It does NOT start the server — that's done in server.js.
//
// Separating app.js from server.js is a best practice because:
//   - It makes the app easier to test (import app without starting server)
//   - It keeps concerns separated

const express = require('express');
const path = require('path');
require('dotenv').config();

// Create the Express application
const app = express();

// --- MIDDLEWARE SETUP ---
// Middleware runs on EVERY request before it reaches a route handler.

// 1. Parse JSON request bodies
// This allows us to access req.body for POST/PUT requests with JSON payloads
app.use(express.json());

// 2. Parse URL-encoded request bodies (for HTML form submissions)
app.use(express.urlencoded({ extended: true }));

// 3. Serve static files (HTML, CSS, JS) from the 'public' directory
// When the browser requests /css/style.css, Express will serve public/css/style.css
app.use(express.static(path.join(__dirname, 'public')));

// --- API ROUTES ---
// Mount our route modules at specific base paths.
// The prefix here combines with the paths defined in each router file.

// Authentication routes: /api/auth/register, /api/auth/login, /api/auth/me
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Item (CRUD) routes: /api/items, /api/items/:id
const itemRoutes = require('./routes/itemRoutes');
app.use('/api/items', itemRoutes);

// --- HTML PAGE ROUTES ---
// Serve the HTML view files for multi-page navigation.
// These are NOT API routes — they serve actual HTML pages.

// Serve the login page at /login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Serve the register page at /register
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

// Serve the dashboard page at /dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// Root route: redirect to login page
app.get('/', (req, res) => {
  res.redirect('/login');
});

// --- 404 Handler ---
// If no route matched, send a 404 response
// The '*' wildcard catches any path not matched above
app.use('*', (req, res) => {
  // If the request expects JSON (API call), return JSON 404
  if (req.accepts('json') && req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.originalUrl} not found.`
    });
  }
  // Otherwise redirect to login
  res.redirect('/login');
});

// --- Global Error Handler ---
// This catches any errors passed via next(error) in route handlers
// Four parameters signal to Express this is an error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
