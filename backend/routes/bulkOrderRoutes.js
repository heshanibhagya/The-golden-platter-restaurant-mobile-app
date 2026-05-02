const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createBulkOrder, getBulkOrders, getReadyBulkOrders, updateBulkOrder, deleteBulkOrder } = require('../controllers/bulkOrderController');

/**
 * Multer storage configuration for bulk order contract files.
 * Defines the destination folder and generates unique filenames for uploaded files.
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Files are saved in the 'uploads/' directory
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Generate a unique filename using the current timestamp and original file extension
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Create a new bulk order - Handles optional contract file upload
router.post('/', upload.single('contractFile'), createBulkOrder);

// Retrieve bulk orders with 'Ready' status (for billing)
router.get('/ready', getReadyBulkOrders);

// Retrieve all bulk orders
router.get('/', getBulkOrders);

// Update an existing bulk order - Allows updating the contract file
router.put('/:id', upload.single('contractFile'), updateBulkOrder);

// Delete a bulk order from the system
router.delete('/:id', deleteBulkOrder);

module.exports = router;
