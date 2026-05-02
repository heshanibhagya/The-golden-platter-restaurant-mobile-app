const Menu = require('../models/Menu');
const mongoose = require('mongoose'); // Use mongoose to validate ObjectId

// Add a new menu item
exports.addMenuItem = async (req, res) => {
    try {
        const { foodName, price, category, description } = req.body;
        
        // Check if image exists
        const image = req.file ? req.file.path : '';

        // Validation: Ensure price is greater than zero
        if (price <= 0) {
            return res.status(400).json({ message: 'Price must be greater than zero' });
        }

        // Create new object for the database
        const newItem = new Menu({
            foodName,
            price,
            category,
            description,
            image // Store image path here
        });

        // Save to database
        await newItem.save();
        res.status(201).json({ message: 'Menu item added successfully!', data: newItem });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error, please try again later', error: error.message });
    }
};

// Fetch all menu items from the database
exports.getMenu = async (req, res) => {
    try {
        const menuItems = await Menu.find(); // find() returns all items as an array
        res.status(200).json(menuItems);
    } catch (error) {
        res.status(500).json({ message: 'Error loading menu', error: error.message });
    }
};

// Delete a menu item
exports.deleteMenuItem = async (req, res) => {
    try {
        // Capture ID from the URL (Ex: /api/menu/663abc...)
        const { id } = req.params;

        // Step 1: Check if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format - MongoDB ObjectId required' });
        }

        // Step 2: Find and delete the item from the database
        const deletedItem = await Menu.findByIdAndDelete(id);

        // Step 3: If item is not found, return 404 error
        if (!deletedItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        // Step 4: Return 200 OK response on successful deletion
        res.status(200).json({ message: 'Menu item deleted successfully!', deletedId: id });
    } catch (error) {
        res.status(500).json({ message: 'Server error during deletion', error: error.message });
    }
};

// Update (edit) a menu item
exports.updateMenuItem = async (req, res) => {
    try {
        // Capture ID from the URL (req.params.id)
        const { id } = req.params;

        // Step 1: Check if the ID is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format provided' });
        }

        const { foodName, price, category, description, existingImage } = req.body;

        // Step 2: Image logic - Check if a new image was uploaded
        let imagePath = req.file ? req.file.path : existingImage;

        // Step 3: Validation - Check if price is positive
        if (price && parseFloat(price) <= 0) {
            return res.status(400).json({ message: 'Price must be greater than zero' });
        }

        // Step 4: Find and update the record in the database
        const updatedItem = await Menu.findByIdAndUpdate(
            id,
            { foodName, price, category, description, image: imagePath },
            { new: true, runValidators: true }
        );

        // Step 5: If item is not found in database
        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found for update' });
        }

        // Step 6: Return success response
        res.status(200).json({ message: 'Menu item updated successfully!', data: updatedItem });

    } catch (error) {
        console.error('❌ updateMenuItem Error:', error.message);
        res.status(500).json({ message: 'Server error during update', error: error.message });
    }
};

/**
 * VIVA EXPLANATION:
 * What it does: 
 * This file handles the logic for menu operations. It captures the unique ID from 'req.params.id' 
 * and uses Mongoose commands like 'findByIdAndDelete' to update or delete records in the database.
 * 
 * Why it's used: 
 * A unique identifier (ID) is essential to select a specific database record. 
 * Using the URL to pass this ID is the standard approach for REST APIs.
 */
