// controllers/itemController.js
// Handles all CRUD operations for Items (Notes/Tasks).
//
// All routes in this controller are PROTECTED — meaning the 'protect'
// middleware runs first and sets req.user to the authenticated user.
//
// IMPORTANT SECURITY RULE:
//   Every query filters by userId: { where: { id: ..., userId: req.user.id } }
//   This ensures users can ONLY access their OWN items, never someone else's.

const Item = require('../models/Item');

/**
 * @route   GET /api/items
 * @desc    Get ALL items belonging to the logged-in user
 * @access  Protected
 */
const getAllItems = async (req, res) => {
  try {
    // Find all items WHERE userId matches the logged-in user's id
    // 'order' sorts results by most recently created first
    const items = await Item.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]   // Newest items first
    });

    return res.status(200).json({
      success: true,
      count: items.length,    // How many items were found
      items: items
    });

  } catch (error) {
    console.error('Get all items error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching items.'
    });
  }
};

/**
 * @route   GET /api/items/:id
 * @desc    Get a SINGLE item by its ID (must belong to logged-in user)
 * @access  Protected
 *
 * ':id' is a URL parameter. Example: GET /api/items/5 → req.params.id = '5'
 */
const getItemById = async (req, res) => {
  try {
    const itemId = req.params.id;   // Get the ID from the URL

    // Find ONE item that matches BOTH the item id AND the logged-in user's id
    // This double check prevents users from accessing other users' items
    const item = await Item.findOne({
      where: {
        id: itemId,
        userId: req.user.id    // Security: must belong to this user
      }
    });

    // If item not found (either doesn't exist OR belongs to another user)
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    return res.status(200).json({
      success: true,
      item: item
    });

  } catch (error) {
    console.error('Get item by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching the item.'
    });
  }
};

/**
 * @route   POST /api/items
 * @desc    Create a NEW item for the logged-in user
 * @access  Protected
 *
 * Request body: { title, description }
 */
const createItem = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Create the item and automatically attach it to the logged-in user
    // req.user.id comes from the 'protect' middleware (decoded from the JWT)
    const newItem = await Item.create({
      title: title.trim(),
      description: description ? description.trim() : null,
      userId: req.user.id     // Link this item to the current user
    });

    return res.status(201).json({
      success: true,
      message: 'Item created successfully!',
      item: newItem
    });

  } catch (error) {
    console.error('Create item error:', error);

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
      message: 'Server error creating item.'
    });
  }
};

/**
 * @route   PUT /api/items/:id
 * @desc    Update an EXISTING item (must belong to logged-in user)
 * @access  Protected
 *
 * Request body: { title, description } — both optional for partial update
 */
const updateItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { title, description } = req.body;

    // First, find the item — ensuring it belongs to the current user
    const item = await Item.findOne({
      where: {
        id: itemId,
        userId: req.user.id    // Security check
      }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    // Update only the fields that were provided in the request body
    // If a field is not provided, keep the existing value
    const updatedItem = await item.update({
      title: title ? title.trim() : item.title,
      description: description !== undefined ? description.trim() : item.description
    });

    return res.status(200).json({
      success: true,
      message: 'Item updated successfully!',
      item: updatedItem
    });

  } catch (error) {
    console.error('Update item error:', error);

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
      message: 'Server error updating item.'
    });
  }
};

/**
 * @route   DELETE /api/items/:id
 * @desc    Delete an item (must belong to logged-in user)
 * @access  Protected
 */
const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.id;

    // Find the item — ensuring it belongs to the current user
    const item = await Item.findOne({
      where: {
        id: itemId,
        userId: req.user.id    // Security check
      }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    // Delete the item from the database
    await item.destroy();

    return res.status(200).json({
      success: true,
      message: 'Item deleted successfully!'
    });

  } catch (error) {
    console.error('Delete item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting item.'
    });
  }
};

module.exports = { getAllItems, getItemById, createItem, updateItem, deleteItem };
