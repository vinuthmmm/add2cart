const express = require('express');
const { addReview, getProductReviews } = require('../controllers/reviewController');

const reviewRouter = express.Router();

// Submit review
reviewRouter.post('/add', addReview);

// Fetch reviews for a single product
reviewRouter.get('/:productId', getProductReviews);

module.exports = reviewRouter;
