const express = require('express');
const router = express.Router();
// Controler eken oni function dekama ekawara import karanwa 
const { registerUser, loginUser } = require('../controllers/authController');

// --- Register Route ---
// POST request ekak /register endpoint ekata awama handle karanwa 
router.post('/register', registerUser);

// --- Login Route ---
// POST request ekak /login endpoint ekata awama eka  handle karanwa 
router.post('/login', loginUser);

module.exports = router;