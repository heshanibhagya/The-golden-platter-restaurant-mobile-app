const express = require('express');
const router = express.Router();
// Controller එකෙන් අවශ්‍ය function දෙකම එකවර import කරගන්නවා
const { registerUser, loginUser } = require('../controllers/authController');

// --- Register Route ---
// POST request එකක් /register endpoint එකට ආවම ඒක handle කරනවා
router.post('/register', registerUser);

// --- Login Route ---
// POST request එකක් /login endpoint එකට ආවම ඒක handle කරනවා
router.post('/login', loginUser);

module.exports = router;