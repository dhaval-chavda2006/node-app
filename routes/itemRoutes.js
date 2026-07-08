// routes/itemRoutes.js
// Defines the URL routes for Item (Notes/Tasks) CRUD endpoints.
//
// ALL routes in this file are PROTECTED — the 'protect' middleware
// runs on every route to verify the JWT token.
//
// This router is mounted in app.js at '/api/items', so:
//   router.get('/')       → becomes → GET /api/items
//   router.post('/')      → becomes → POST /api/items
//   router.get('/:id')    → becomes → GET /api/items/:id
//   router.put('/:id')    → becomes → PUT /api/items/:id
//   router.delete('/:id') → becomes → DELETE /api/items/:id

const express = require('express');
const router = express.Router();

// Import CRUD controller functions
const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
} = require('../controllers/itemController');

// Import middleware
const { protect } = require('../middleware/authMiddleware');
const { validateItem } = require('../middleware/validationMiddleware');

// --- Route Definitions ---
// protect middleware is applied to EVERY route in this file

// GET /api/items → Get all items for the logged-in user
router.get('/', protect, getAllItems);

// GET /api/items/:id → Get a specific item by ID
router.get('/:id', protect, getItemById);

// POST /api/items → Create a new item
// Flow: protect (verify JWT) → validateItem (check input) → createItem
router.post('/', protect, validateItem, createItem);

// PUT /api/items/:id → Update an existing item
// Flow: protect → validateItem → updateItem
router.put('/:id', protect, validateItem, updateItem);

// DELETE /api/items/:id → Delete an item
router.delete('/:id', protect, deleteItem);

module.exports = router;
