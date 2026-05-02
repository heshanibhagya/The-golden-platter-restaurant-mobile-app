const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure 'uploads/orders' directory exists
const uploadDir = 'uploads/orders';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration for order instruction images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

/**
 * ORDER ROUTES - Individually protected with authMiddleware
 * 
 * NOTE: authMiddleware is applied individually to each route to ensure 
 * consistent JSON error responses and avoid routing conflicts in Express 5.
 */

// 1. Create a new order (POST /api/orders)
// 'instructionImage' is an optional file field for special customer notes
router.post('/', authMiddleware, upload.single('instructionImage'), (req, res, next) => {
    console.log("DEBUG: Received file data ->", req.file); // Backend debug log
    next();
}, orderController.createOrder);

// 2. Get all orders (GET /api/orders) - Intended for Admin/Kitchen use
router.get('/', authMiddleware, orderController.getAllOrders);

// 2.1 Get only Pending orders (GET /api/orders/kitchen) - For KDS display
router.get('/kitchen', authMiddleware, orderController.getKitchenOrders);

// 3. Get logged-in user's orders (GET /api/orders/my-orders)
router.get('/my-orders', authMiddleware, orderController.getUserOrders);

// 4. Update order status (PUT /api/orders/:id)
router.put('/:id', authMiddleware, orderController.updateOrderStatus);

// 5. Mark as Ready with Final Dish Photo (PUT /api/orders/ready/:id)
// 'image' is the key for the prepared dish photo uploaded by the kitchen
router.put('/ready/:id', authMiddleware, upload.single('image'), orderController.markOrderAsReady);

// 5.1 Quick Mark as Ready (PATCH /api/orders/:id/status) - No photo required
router.patch('/:id/status', authMiddleware, orderController.updateToReady);

// 7. Get Ready orders (GET /api/orders/ready) - For Billing generation
router.get('/ready', authMiddleware, orderController.getReadyOrders);

// 6. Delete or Cancel an order (DELETE /api/orders/:id)
router.delete('/:id', authMiddleware, orderController.deleteOrder);

module.exports = router;

/**
 * VIVA EXPLANATION:
 * What it does:
 * Defines all the HTTP endpoints for Order management, mapping routes to controller functions.
 * 
 * Why it's used:
 * Adhering to the MVC pattern separates routing from business logic, ensuring the codebase is organized.
 * Individual protection with authMiddleware ensures that only authenticated users can access order-related operations.
 */
