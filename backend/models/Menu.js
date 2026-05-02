const mongoose = require('mongoose');

// Define Menu structure
const menuSchema = new mongoose.Schema({
  foodName: {
    type: String,
    required: [true, 'Food name is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
  },
  category: {
    type: String,
    required: [true, 'Category (Ex: Drinks, Foods) is required'],
  },
  description: {
    type: String,
  },
  image: {
    type: String, // Store the file path for the image
  },
  isAvailable: {
    type: Boolean,
    default: true, // Default set to available
  }
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

module.exports = mongoose.model('Menu', menuSchema);

/**
 * What it does: 
 * This file defines the schema for the 'Menu' collection in the database. 
 * It specifies the fields (foodName, price, etc.) required for menu items.
 * 
 * Why it's used: 
 * Required to ensure data is saved in a structured manner in the database.
 * Mongoose acts as the link between the backend and MongoDB.
 */
