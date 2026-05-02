const BulkOrder = require('../models/bulkOrderModel');

// 1. Function to create a new bulk order
const createBulkOrder = async (req, res) => {
    try {
        const { customerName, eventDate, eventType, totalGuestCount, totalAmount, advanceAmount, specialNotes } = req.body;

        // Numeric validation logic
        const parsedTotal = Number(totalAmount) || 0;
        const parsedAdvance = Number(advanceAmount) || 0;

        if (isNaN(parsedTotal) || isNaN(parsedAdvance)) {
            return res.status(400).json({ success: false, message: "Invalid amount values provided" });
        }

        // Manual calculation for remaining balance
        const remainingBalance = parsedTotal - parsedAdvance;

        // Validation: Ensure guest count is positive
        if (Number(totalGuestCount) <= 0) {
            return res.status(400).json({ success: false, message: 'Guest count must be a positive number' });
        }

        // Capture uploaded file path
        const contractFile = req.file ? `/uploads/${req.file.filename}` : null;

        const newBulkOrder = new BulkOrder({
            customerName,
            eventDate,
            eventType,
            totalGuestCount: Number(totalGuestCount),
            totalAmount: parsedTotal,
            advanceAmount: parsedAdvance,
            remainingBalance: remainingBalance,
            orderType: 'Bulk',
            specialNotes,
            contractFile,
            status: 'Pending'
        });

        await newBulkOrder.save();
        res.status(201).json({ success: true, message: 'Bulk order created successfully', order: newBulkOrder });
    } catch (error) {
        console.error('Error creating bulk order:', error);
        res.status(500).json({ success: false, message: 'Server error while creating bulk order' });
    }
};

// 2. Function to fetch all bulk orders from the database
const getBulkOrders = async (req, res) => {
    try {
        const orders = await BulkOrder.find().sort({ eventDate: 1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching bulk orders:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching bulk orders' });
    }
};

// 3. Function to update an existing bulk order
const updateBulkOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { customerName, eventDate, eventType, totalGuestCount, totalAmount, advanceAmount, specialNotes, status } = req.body;

        // Numeric validation and calculation
        const parsedTotal = Number(totalAmount) || 0;
        const parsedAdvance = Number(advanceAmount) || 0;
        const remainingBalance = parsedTotal - parsedAdvance;

        const updateData = {
            customerName,
            eventDate,
            eventType,
            totalGuestCount: Number(totalGuestCount),
            totalAmount: parsedTotal,
            advanceAmount: parsedAdvance,
            remainingBalance: remainingBalance,
            specialNotes,
            status
        };

        if (req.file) {
            updateData.contractFile = `/uploads/${req.file.filename}`;
        }

        const updatedOrder = await BulkOrder.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Bulk order not found' });
        }

        res.status(200).json({ success: true, message: 'Bulk order updated successfully', order: updatedOrder });
    } catch (error) {
        console.error('Error updating bulk order:', error);
        res.status(500).json({ success: false, message: 'Server error while updating bulk order' });
    }
};

// 4. Function to delete a bulk order
const deleteBulkOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedOrder = await BulkOrder.findByIdAndDelete(id);

        if (!deletedOrder) {
            return res.status(404).json({ success: false, message: 'Bulk order not found' });
        }

        res.status(200).json({ success: true, message: 'Bulk order deleted successfully' });
    } catch (error) {
        console.error('Error deleting bulk order:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting bulk order' });
    }
};

// 5. Function to fetch bulk orders with 'Ready' status
const getReadyBulkOrders = async (req, res) => {
    try {
        const orders = await BulkOrder.find({ status: 'Ready' }).sort({ eventDate: 1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error('Error fetching ready bulk orders:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching ready bulk orders' });
    }
};

module.exports = {
    createBulkOrder,
    getBulkOrders,
    getReadyBulkOrders,
    updateBulkOrder,
    deleteBulkOrder
};
