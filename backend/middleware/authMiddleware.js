const jwt = require('jsonwebtoken');

// Me middleware eka routes protect karanna use karanawa
const authMiddleware = async (req, res, next) => {
    let token;

    // Check whether the Authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token from "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];

            // Verify the token against the secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach the verified user payload to the request object
            req.user = decoded;

            // Pass control to the next middleware or controller
            next();
        } catch (error) {
            // ✅ FIX: return here to prevent further code execution
            return res.status(401).json({ success: false, message: 'Access denied. Invalid or expired token.' });
        }
    } else {
        // ✅ FIX: Use 'else if' to prevent double-response crash
        // This block only runs if the 'if' above did NOT execute
        return res.status(401).json({ success: false, message: 'Access denied. No authorization token provided.' });
    }
};

module.exports = authMiddleware;

/**
 * VIVA EXPLANATION:
 * What it does:
 * This middleware checks the JWT token on every protected API request.
 * Only if the token is valid does it allow the request to reach the controller.
 *
 * Why it's used:
 * To ensure that only authenticated (logged-in) users can access
 * protected routes such as placing orders or managing the menu.
 *
 * BUG FIX NOTE:
 * The original code used two separate 'if' blocks. This caused a crash
 * because when a bad token was sent, it would call res.status(401) AND
 * then the second 'if(!token)' would also try to send another response,
 * causing a 'Cannot set headers after they are sent' error.
 * Fixed by using 'if/else' to ensure only ONE response is ever sent.
 */
