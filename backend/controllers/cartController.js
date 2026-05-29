const { getPool } = require('../config/db');

// Add product to user cart
const addToCart = async (req, res) => {
    try {
        const { userId, itemId, size, quantity } = req.body;

        if (!itemId || !size) {
            return res.status(400).json({ success: false, message: "Missing item ID or size." });
        }

        const qty = quantity ? Number(quantity) : 1;
        const pool = getPool();

        // Check if the combination already exists
        const [existing] = await pool.query(
            "SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND size = ?",
            [userId, itemId, size]
        );

        if (existing.length > 0) {
            // Increment quantity by custom qty
            await pool.query(
                "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ? AND size = ?",
                [qty, userId, itemId, size]
            );
        } else {
            // Insert new cart item with custom qty
            await pool.query(
                "INSERT INTO cart (user_id, product_id, size, quantity) VALUES (?, ?, ?, ?)",
                [userId, itemId, size, qty]
            );
        }

        return res.json({ success: true, message: "Added to cart." });
    } catch (error) {
        console.error("Add To Cart Error:", error);
        return res.status(500).json({ success: false, message: "Server error while adding to cart." });
    }
};

// Update user cart quantity
const updateCart = async (req, res) => {
    try {
        const { userId, itemId, size, quantity } = req.body;

        if (!itemId || !size || quantity === undefined) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        const pool = getPool();

        if (quantity <= 0) {
            // Delete from cart if quantity is 0 or less
            await pool.query(
                "DELETE FROM cart WHERE user_id = ? AND product_id = ? AND size = ?",
                [userId, itemId, size]
            );
        } else {
            // Update quantity
            // Using REPLACE or INSERT ON DUPLICATE KEY UPDATE for robustness
            await pool.query(
                `INSERT INTO cart (user_id, product_id, size, quantity) 
                 VALUES (?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
                [userId, itemId, size, quantity]
            );
        }

        return res.json({ success: true, message: "Cart updated." });
    } catch (error) {
        console.error("Update Cart Error:", error);
        return res.status(500).json({ success: false, message: "Server error while updating cart." });
    }
};

// Get user cart data
const getUserCart = async (req, res) => {
    try {
        const { userId } = req.body;
        const pool = getPool();

        // Fetch all cart items for user
        const [cartRows] = await pool.query(
            "SELECT product_id, size, quantity FROM cart WHERE user_id = ?",
            [userId]
        );

        // Format cartRows into nested object: { itemId: { size: quantity } }
        const cartData = {};
        for (const row of cartRows) {
            if (!cartData[row.product_id]) {
                cartData[row.product_id] = {};
            }
            cartData[row.product_id][row.size] = row.quantity;
        }

        return res.json({ success: true, cartData });
    } catch (error) {
        console.error("Get User Cart Error:", error);
        return res.status(500).json({ success: false, message: "Server error while fetching cart." });
    }
};

module.exports = { addToCart, updateCart, getUserCart };
