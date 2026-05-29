const express = require('express');
const { addToCart, updateCart, getUserCart } = require('../controllers/cartController');
const authUser = require('../middleware/auth');

const cartRouter = express.Router();

// All cart actions require user authentication
cartRouter.post('/get', authUser, getUserCart);
cartRouter.post('/add', authUser, addToCart);
cartRouter.post('/update', authUser, updateCart);

module.exports = cartRouter;
