const jwt = require('jsonwebtoken');

const authUser = async (req, res, next) => {
    try {
        let token = req.headers.token;

        // Fallback to Authorization header if token header is not present
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not Authorized. Please Login Again.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = decoded.id; // Attach decoded user ID to the request body
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(401).json({ success: false, message: 'Session Expired or Invalid Token. Please login again.' });
    }
};

module.exports = authUser;
