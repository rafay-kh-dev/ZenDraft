const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        // Check if token exists
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log("❌ Auth Error: No Token or invalid format");
            return res.status(401).json({ error: 'Access Denied. No token provided.' });
        }

        // Extract token
        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded payload (which contains userId) to req.user
        req.user = decoded;
        
        next();
    } catch (error) {
        console.error("❌ Auth Middleware Error:", error.message);
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
};