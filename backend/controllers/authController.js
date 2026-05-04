const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// --- User kenek register (create) karana function eka ---
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validation 
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields (Name, Email, Password)' });
    }

    // 2. Email eka kalin use karalada balanwa 
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'This email is already registered. Please login or use a different email.' });
    }

    // 3. new User kenek hadanwa 
    const user = new User({
      name,
      email,
      password,
      role: role || 'staff' // Default role eka staff widiyata gannawa
    });

    // 4. Database ekata Save karanwa 
    await user.save();

    // 5. JWT Token ekak hadanwa 
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'your_secret_key', 
      { expiresIn: '1d' }
    );

    // 6. right answer 
    res.status(201).json({
      message: 'User registered successfully!', 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('❌ Registration Error:', error.message);
    
    // Mongoose validation errors handle karanawa (Ex: Password length)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error during registration. Please try again later.' });
  }
};


// --- User Login karana  function eka  ---
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Email eka saha  Password eka ewala thiyenwada balanwa 
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        // 2. Email eken  User kenek innwada balanwa 
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // 3. Password eka sasadala balanawa  (bcrypt.compare)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // 4. JWT Token ekak hadanwa 
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 5. right answers gannwa 
        res.status(200).json({
            message: "Login successful",
            token,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role 
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: "Server error during login" });
    }
};