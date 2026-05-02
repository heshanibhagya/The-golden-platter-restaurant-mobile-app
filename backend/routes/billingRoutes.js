const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure 'uploads/billing' directory exists
const uploadDir = 'uploads/billing';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage settings
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, 'Invoice-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Routes
router.post('/', authMiddleware, upload.single('invoice'), billingController.createBill);
router.get('/', authMiddleware, billingController.getBillingHistory);
router.get('/fetch-order/:id', authMiddleware, billingController.getOrderDetails); // Order details fetch karanna
router.patch('/:id', authMiddleware, billingController.updatePaymentStatus);
router.delete('/:id', authMiddleware, billingController.deleteBill);

module.exports = router;

/**
 * VIVA EXPLANATION:
 * What it does:
 * Billing API eke okkoma routes tika meke define karanawa. (All Billing API routes are defined here)
 * Multer use karala invoice files upload karanna puluwan widiyata hadala thiyenne. (Set up to upload invoice files using Multer)
 * 
 * Why it's used:
 * RESTful API standards follow karanna saha security ekata authMiddleware use karanawa. (To follow RESTful API standards and use authMiddleware for security)
 */
