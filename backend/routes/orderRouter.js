const express = require('express');
const { placeOrder, userOrders, allOrders, updateStatus, verifyPayment, updatePayment, getMerchantUpi, updateMerchantUpi } = require('../controllers/orderController');
const authUser = require('../middleware/auth');

const orderRouter = express.Router();

// Order operations require user authentication
orderRouter.post('/place', authUser, placeOrder);
orderRouter.post('/userorders', authUser, userOrders);
orderRouter.post('/verify', authUser, verifyPayment);
orderRouter.get('/merchant-upi', getMerchantUpi);

// Admin Order Management
orderRouter.get('/list', allOrders);
orderRouter.post('/status', updateStatus);
orderRouter.post('/update-payment', updatePayment);
orderRouter.post('/merchant-upi/update', updateMerchantUpi);

module.exports = orderRouter;
