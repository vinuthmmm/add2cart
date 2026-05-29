const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./config/db');

// Import Routers
const userRouter = require('./routes/userRouter');
const productRouter = require('./routes/productRouter');
const cartRouter = require('./routes/cartRouter');
const orderRouter = require('./routes/orderRouter');
const reviewRouter = require('./routes/reviewRouter');

// App Config
const app = express();
const port = process.env.PORT || 4000;

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// Request Logger Middleware
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url} - IP: ${req.ip} - User-Agent: ${req.headers['user-agent']}`);
    next();
});

// API Endpoints
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/review', reviewRouter);

// Root route
app.get('/', (req, res) => {
    res.send("API Working Successfully!");
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("[SERVER ERROR]:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error"
    });
});

// Start Server and Connect DB
const startServer = async () => {
    try {
        // Connect to Database
        await connectDB();
        
        // Listen on Port
        app.listen(port, () => {
            console.log(`Server started running on port: ${port}`);
        });
    } catch (error) {
        console.error("Failed to start the server:", error);
        process.exit(1);
    }
};

startServer();
