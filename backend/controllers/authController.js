const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// --- User කෙනෙක් register (create) කරන function එක ---
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validation - අත්‍යවශ්‍ය දත්ත තිබේදැයි බැලීම
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields (Name, Email, Password)' });
    }

    // 2. Email එක කලින් පාවිච්චි කර ඇත්දැයි බැලීම
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'This email is already registered. Please login or use a different email.' });
    }

    // 3. අලුත් User කෙනෙක් සෑදීම
    const user = new User({
      name,
      email,
      password,
      role: role || 'staff' // Default role eka staff widiyata gannawa
    });

    // 4. Database එකට Save කිරීම
    await user.save();

    // 5. JWT Token එකක් සෑදීම
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'your_secret_key', 
      { expiresIn: '1d' }
    );

    // 6. සාර්ථක ප්‍රතිචාරය
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


// --- User Login කරන function එක ---
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Email එක සහ Password එක එවලා තියෙනවාද බලනවා
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        // 2. Email එකෙන් User කෙනෙක් ඉන්නවද කියලා බලනවා
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // 3. Password එක සසඳා බැලීම (bcrypt.compare)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // 4. JWT Token එකක් සෑදීම
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 5. සාර්ථක ප්‍රතිචාරය ලබා දීම
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