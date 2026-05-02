const mongoose = require('mongoose');

// Bulk Order schema ekai meka (This is the Bulk Order schema)
// Meken thamai database eke save wena format eka define karanne (This defines the format saved in the database)
const bulkOrderSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true,
    },
    eventDate: {
        type: Date,
        required: true,
    },
    eventType: {
        type: String,
        required: true,
    },
    totalGuestCount: {
        type: Number,
        required: true,
    },
    specialNotes: {
        type: String,
        required: false,
    },
    contractFile: {
        type: String, // Path to the uploaded file eka save wenne methana (Path to the uploaded file is saved here)
        required: false,
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    advanceAmount: {
        type: Number,
        default: 0
    },
    remainingBalance: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Pending', 'Ready', 'Paid', 'Cancelled'],
        default: 'Pending'
    }
}, { timestamps: true }); // Create, update time save wenawa (Create, update time is saved)

module.exports = mongoose.model('BulkOrder', bulkOrderSchema);
