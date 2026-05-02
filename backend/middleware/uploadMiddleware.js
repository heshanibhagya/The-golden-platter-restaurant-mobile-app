const multer = require('multer');
const path = require('path');

// Configure storage destination and filename
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory where images will be saved
    },
    filename: (req, file, cb) => {
        // Generate a unique filename using timestamp and original extension
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Filter allowed file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only JPG, JPEG, and PNG files are allowed!'));
    }
};

// Initialize Multer with configuration
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Max file size limit: 2MB
    fileFilter: fileFilter
});

module.exports = upload;

/**
 * What it does: 
 * Sets up the configuration for image uploads using the Multer library. 
 * It filters images to the 'uploads' folder and enforces a 2MB size limit.
 * 
 * Why it's used: 
 * Multer is essential for processing multipart/form-data when users upload images to the backend. 
 * Validation ensures only supported image formats are stored on the server.
 */
