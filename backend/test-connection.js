const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
require('dotenv').config();

// Force IPv4 to avoid potential network connection issues
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Real-time socket communication logic
io.on('connection', (socket) => {
    console.log('🔌 A user connected:', socket.id);
    socket.on('disconnect', () => console.log('🔌 User disconnected'));
});

// Middleware to inject 'io' instance into controllers for real-time updates
app.use((req, res, next) => {
    req.io = io;
    next();
});

// --- Middleware ---

// 1. CORS: Allows cross-origin requests from the mobile app or browser
app.use(cors()); 

// 2. Body Parser: Enables Express to parse incoming JSON data
app.use(express.json());

// 3. Static File Serving: Expose folders for uploaded images and invoices
app.use('/uploads', express.static('uploads'));
app.use('/uploads/billing', express.static('uploads/billing'));

// --- Route Definitions ---

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const bulkOrderRoutes = require('./routes/bulkOrderRoutes');
const billingRoutes = require('./routes/billingRoutes');

// --- Route Mounting ---
// Maps incoming requests to the appropriate route handlers

app.use('/api/auth', authRoutes);   // Handles login and registration
app.use('/api/menu', menuRoutes);   // Handles menu item CRUD operations
app.use('/api/orders', orderRoutes); // Handles regular order CRUD operations
app.use('/api/bulk-orders', bulkOrderRoutes); // Handles bulk event bookings
app.use('/api/billing', billingRoutes); // Handles invoice generation and history

// --- Debug/Health Check Endpoints ---

// Simple connectivity test
app.get('/api/ping', (req, res) => {
    res.json({ message: "Server is reachable!" });
});

// Order route diagnostic endpoint
app.get('/api/orders/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Order route is working!' });
});

// --- Database Connection ---

mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('✅ Connected to MongoDB Atlas!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// --- Server Startup ---

const PORT = process.env.PORT || 5000;

// Listening on '0.0.0.0' allows access from any IP on the local network
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 Local Network Access enabled: http://0.0.0.0:${PORT}`);
});

/**
 * VIVA EXPLANATION:
 * What it does:
 * Serves as the primary entry point for the backend application. 
 * It initializes the server, establishes a database connection, and configures all routing.
 *
 * Why it's used:
 * Centralizing the initialization logic makes the application easier to manage. 
 * Mapping specific URL patterns to dedicated route files follows the MVC architectural pattern for better modularity.
 *
 * IMPORTANT NOTE:
 * This file is the result of merging previous server-side configurations to ensure a single, stable entry point.
 */