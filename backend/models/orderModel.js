const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Ready', 'Completed', 'Cancelled', 'Paid'],
        default: 'Pending'
    },
    customerNoteImage: {
        type: String, // Special note photo path from customer
        default: null
    },
    finalDishImage: {
        type: String, // Final dish photo path from kitchen
        default: null
    }
}, { timestamps: true }); // Meken 'createdAt' saha 'updatedAt' auto hadenawa

module.exports = mongoose.model('Order', orderSchema);
