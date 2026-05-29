const { getPool } = require('../config/db');

// Add a new review for a product
const addReview = async (req, res) => {
    try {
        const { product_id, user_name, rating, comment } = req.body;

        if (!product_id || !user_name || !rating || !comment) {
            return res.status(400).json({ success: false, message: "Missing required review fields." });
        }

        if (Number(rating) < 1 || Number(rating) > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
        }

        const pool = getPool();
        await pool.query(
            "INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (?, ?, ?, ?)",
            [product_id, user_name, Number(rating), comment]
        );

        return res.status(201).json({ success: true, message: "Review Submitted Successfully!" });
    } catch (error) {
        console.error("Add Review Error:", error);
        return res.status(500).json({ success: false, message: "Server error while submitting review." });
    }
};

// Fetch all reviews and live calculations for a product
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Missing product ID." });
        }

        const pool = getPool();
        
        // Fetch reviews
        const [reviews] = await pool.query(
            "SELECT id, user_name, rating, comment, date FROM reviews WHERE product_id = ? ORDER BY date DESC",
            [productId]
        );

        // Fetch rating calculations (average rating and counts)
        const [stats] = await pool.query(
            "SELECT COUNT(*) as count, AVG(rating) as averageRating FROM reviews WHERE product_id = ?",
            [productId]
        );

        const reviewCount = stats[0].count || 0;
        const rawAvg = stats[0].averageRating || 0;
        const averageRating = Number(Number(rawAvg).toFixed(1)); // Format to 1 decimal place

        return res.json({
            success: true,
            reviews,
            stats: {
                count: reviewCount,
                averageRating: averageRating
            }
        });
    } catch (error) {
        console.error("Get Product Reviews Error:", error);
        return res.status(500).json({ success: false, message: "Server error while loading reviews." });
    }
};

module.exports = { addReview, getProductReviews };
