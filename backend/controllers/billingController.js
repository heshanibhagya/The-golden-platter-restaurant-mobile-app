const Billing = require('../models/billingModel');
const Order = require('../models/orderModel');
const BulkOrder = require('../models/bulkOrderModel');
const fs = require('fs');
const path = require('path');

// 1. Create Bill (Generate Bill)
exports.createBill = async (req, res) => {
    try {
        const { orderId, customerName, subTotal, tax, discount, totalAmount, billingDate } = req.body;

        // Ensure the directory exists to avoid crashes
        const uploadDir = 'uploads/billing';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an invoice file.' });
        }

        const newBill = new Billing({
            orderId,
            customerName,
            subTotal: parseFloat(subTotal),
            tax: parseFloat(tax),
            discount: parseFloat(discount),
            totalAmount: parseFloat(totalAmount),
            billingDate: billingDate || Date.now(),
            paymentStatus: 'Paid', // Automatically mark as Paid during creation
            
            invoiceUrl: `https://the-golden-platter-restaurant-mobile-app.onrender.com/uploads/billing/${req.file.filename}`
        });

        await newBill.save();

        // Conditional Status Update Logic for Bulk and Normal Orders
        const bulkOrder = await BulkOrder.findById(orderId);
        if (bulkOrder) {
            const paidNow = parseFloat(totalAmount); // Amount in this bill
            const newTotalAdvance = (bulkOrder.advanceAmount || 0) + paidNow;
            
            let newStatus = 'Pending';
            // Set status to 'Paid' if the full amount has been settled
            if (newTotalAdvance >= bulkOrder.totalAmount) {
                newStatus = 'Paid';
            }
            
            await BulkOrder.findByIdAndUpdate(orderId, { 
                advanceAmount: newTotalAdvance, 
                status: newStatus,
                remainingBalance: bulkOrder.totalAmount - newTotalAdvance
            });
        } else {
            // Mark Normal Order as 'Paid'
            await Order.findByIdAndUpdate(orderId, { status: 'Paid' });
        }

        res.status(201).json({ success: true, message: 'Bill processed successfully!', bill: newBill });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to generate bill.', error: error.message });
    }
};

// 2. Get All Bills (History)
exports.getBillingHistory = async (req, res) => {
    try {
        // Fetch only 'Paid' records
        const bills = await Billing.find({ paymentStatus: 'Paid' }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, bills });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch billing history.' });
    }
};

// 3. Update Payment Status (Mark as Paid)
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedBill = await Billing.findByIdAndUpdate(
            id,
            { paymentStatus: status },
            { returnDocument: 'after' }
        );

        if (!updatedBill) {
            return res.status(404).json({ success: false, message: 'Bill not found.' });
        }

        res.status(200).json({ success: true, message: `Payment status updated to ${status}`, bill: updatedBill });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update payment status.' });
    }
};

// 4. Delete Bill
exports.deleteBill = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBill = await Billing.findByIdAndDelete(id);

        if (!deletedBill) {
            return res.status(404).json({ success: false, message: 'Bill not found.' });
        }

        res.status(200).json({ success: true, message: 'Bill record deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete bill record.' });
    }
};

// 5. Get Order/BulkOrder Details by ID
exports.getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if it's a regular order
        let order = await Order.findById(id).populate('userId', 'name email');
        
        // If not found, check if it's a bulk order
        if (!order) {
            order = await BulkOrder.findById(id);
        }

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order or Bulk Order not found.' });
        }

        // Structure the response for the frontend display
        res.status(200).json({ 
            success: true, 
            totalAmount: order.totalAmount || (order.totalGuestCount * 1000), 
            advanceAmount: order.advanceAmount || 0,
            customerName: order.customerName || (order.userId ? order.userId.name : 'Guest Customer'),
            items: order.items || [{ name: `${order.eventType || 'Bulk'} Event`, quantity: order.totalGuestCount || 1, price: 1000 }]
        });
    } catch (error) {
        console.error("Fetch Details Error:", error.message);
        res.status(500).json({ success: false, message: 'Error fetching order details.' });
    }
};

/**
 * VIVA EXPLANATION:
 * What it does:
 * These controllers are used to handle CRUD operations in the billing module.
 * 
 * Why it's used:
 * Separating logic from routes is a good coding practice to maintain cleanliness and scalability.
 */