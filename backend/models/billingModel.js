const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    subTotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    totalAmount: { // Final total amount after tax and discount
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending'
    },
    billingDate: {
        type: Date,
        default: Date.now
    },
    invoiceUrl: {
        type: String, // PDF nattan Image path eka (Path to PDF or Image)
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Billing', billingSchema);

/**
 * VIVA EXPLANATION:
 * What it does:
 * Billing management walata adala data structure eka meken hadagannawa. (Defines the data structure for billing management)
 * 
 * Why it's used:
 * Payment history eka saha invoice details MongoDB wala save karaganna me schema eka ona wenawa. (This schema is needed to save payment history and invoice details in MongoDB)
 */
