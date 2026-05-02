const express = require('express');
const router = express.Router();

// Import controller functions and required middleware
const { addMenuItem, getMenu, deleteMenuItem, updateMenuItem } = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public route: View the entire menu
router.get('/', getMenu);

// Protected route: Add a new menu item
router.post('/add', authMiddleware, upload.single('image'), addMenuItem);

// Update an existing menu item - Requires item ID in the URL
// Pattern: PUT /api/menu/:id
router.put('/:id', authMiddleware, upload.single('image'), updateMenuItem);

// Delete a menu item - Requires item ID in the URL
// Pattern: DELETE /api/menu/:id
router.delete('/:id', authMiddleware, deleteMenuItem);

module.exports = router;

/**
 * VIVA EXPLANATION:
 * What it does: 
 * Routes incoming frontend requests to the appropriate controller functions.
 * ':id' is a dynamic parameter used to capture the unique ID of the menu item.
 * 
 * Why it's used: 
 * The ID in the URL allows the backend to identify which specific record needs to be updated or deleted.
 */
