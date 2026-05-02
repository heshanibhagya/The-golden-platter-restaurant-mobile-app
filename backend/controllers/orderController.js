const Order = require('../models/orderModel');

// 1. Create Order (POST /api/orders)
// Function to save a new order
exports.createOrder = async (req, res) => {
    try {
        const { items, totalAmount } = req.body;
        
        // Convert items string to JSON format
        const parsedItems = JSON.parse(items);

        let imagePath = null;
        if (req.file) {
            imagePath = `/uploads/orders/${req.file.filename}`;
        }

        const newOrder = new Order({
            userId: req.user.id, // User ID from auth middleware
            items: parsedItems,
            totalAmount: parseFloat(totalAmount),
            customerNoteImage: imagePath
        });

        await newOrder.save();

        // Emit real-time notification via Socket.io
        if (req.io) {
            req.io.emit('newOrder', newOrder);
        }
        res.status(201).json({ 
            success: true, 
            message: 'Order placed successfully!', 
            order: newOrder 
        });
    } catch (error) {
        console.error("Order error:", error.message);
        res.status(500).json({ success: false, message: 'Failed to place order.', error: error.message });
    }
};

// 2. Get All Orders (For Admin/Kitchen use)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
    }
};

// 3. Get Logged-in User's Orders
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve your orders.' });
    }
};

// 4. Update Order Status (Ready, Completed, etc.)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        let readyDishImagePath = null;

        // Capture photo if uploaded via Multer
        if (req.file) {
            readyDishImagePath = `/uploads/orders/${req.file.filename}`;
        }

        const updateData = { status };
        if (readyDishImagePath) updateData.finalDishImage = readyDishImagePath;

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            updateData,
            { returnDocument: 'after' }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        // Emit real-time updates via Socket.io for Admin and Customer
        if (req.io) {
            req.io.emit('orderUpdated', updatedOrder);
            req.io.emit('statusUpdate', { orderId: id, status, photo: readyDishImagePath });
        }

        res.status(200).json({ 
            success: true, 
            message: `Order status updated to ${status}.`, 
            order: updatedOrder 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update order status.' });
    }
};

// 5. Delete or Cancel an Order
exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedOrder = await Order.findByIdAndDelete(id);

        if (!deletedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        res.status(200).json({ success: true, message: 'Order deleted successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete order.' });
    }
};

// 6. Mark Order as Ready with Final Dish Photo
exports.markOrderAsReady = async (req, res) => {
    try {
        const { id } = req.params;
        let readyDishImagePath = null;

        if (req.file) {
            readyDishImagePath = `/uploads/orders/${req.file.filename}`;
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { 
                status: 'Ready',
                finalDishImage: readyDishImagePath
            },
            { returnDocument: 'after' }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        // Emit real-time notification to the Admin Dashboard
        if (req.io) {
            req.io.emit('orderUpdated', updatedOrder);
            req.io.emit('statusUpdate', { orderId: id, status: 'Ready', photo: readyDishImagePath });
        }

        res.status(200).json({ 
            success: true,
            message: 'Order is now Ready!', 
            order: updatedOrder 
        });
    } catch (error) {
        console.error("KDS Error:", error.message);
        res.status(500).json({ success: false, message: 'Failed to update order to Ready.' });
    }
};

// 7. Get Pending Orders for the Kitchen
exports.getKitchenOrders = async (req, res) => {
    try {
        // Filter only 'Pending' orders, sorted by oldest first (FIFO)
        const orders = await Order.find({ status: 'Pending' })
            .populate('userId', 'name')
            .sort({ createdAt: 1 });

        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve kitchen orders.' });
    }
};

// 8. Quick Update Status to Ready
// Used in the KDS to mark an order as ready
exports.updateToReady = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status: 'Ready' },
            { returnDocument: 'after' }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        // Emit real-time refresh event
        if (req.io) {
            req.io.emit('orderUpdated', updatedOrder);
            req.io.emit('statusUpdate', { orderId: id, status: 'Ready' });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Order status updated to Ready.', 
            order: updatedOrder 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update order status.' });
    }
};

// 9. Get Ready Orders for Billing
exports.getReadyOrders = async (req, res) => {
    try {
        // Filter 'Ready' orders intended for billing
        const orders = await Order.find({ status: 'Ready' })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve ready orders.' });
    }
};
