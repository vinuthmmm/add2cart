const { getPool } = require('../config/db');

// Place Order using Cash on Delivery (or simple gateway simulation)
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address, paymentMethod } = req.body;

        if (!items || !amount || !address || !paymentMethod) {
            return res.status(400).json({ success: false, message: "Missing required checkout information." });
        }

        const pool = getPool();

        // Save order to the database
        const [result] = await pool.query(
            `INSERT INTO orders (user_id, items, amount, address, paymentMethod, payment, date)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                JSON.stringify(items),
                amount,
                JSON.stringify(address),
                paymentMethod,
                paymentMethod === 'cod' ? 0 : 0, // All orders start as unpaid (0) until payment is verified/completed
                Date.now()
            ]
        );

        const orderId = result.insertId;

        // Clear the user's cart in the database upon successful order
        await pool.query("DELETE FROM cart WHERE user_id = ?", [userId]);

        return res.status(201).json({ success: true, message: "Order placed successfully!", orderId });
    } catch (error) {
        console.error("Place Order Error:", error);
        return res.status(500).json({ success: false, message: "Server error while placing order." });
    }
};

// Retrieve Order History for the authenticated user
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const pool = getPool();

        // Get orders for the user sorted by date descending
        const [orders] = await pool.query(
            "SELECT * FROM orders WHERE user_id = ? ORDER BY date DESC",
            [userId]
        );

        // Format orders and parse JSON strings back to objects/arrays
        const formattedOrders = orders.map((order) => {
            let parsedItems = {};
            let parsedAddress = {};

            try {
                parsedItems = JSON.parse(order.items);
            } catch (err) {
                parsedItems = {};
            }

            try {
                parsedAddress = JSON.parse(order.address);
            } catch (err) {
                parsedAddress = {};
            }

            return {
                ...order,
                items: parsedItems,
                address: parsedAddress,
                payment: order.payment
            };
        });

        return res.json({ success: true, orders: formattedOrders });
    } catch (error) {
        console.error("Fetch User Orders Error:", error);
        return res.status(500).json({ success: false, message: "Server error while fetching orders." });
    }
};

// Get all orders in database (Admin)
const allOrders = async (req, res) => {
    try {
        const pool = getPool();
        const [orders] = await pool.query("SELECT * FROM orders ORDER BY date DESC");

        const formattedOrders = orders.map((order) => {
            let parsedItems = {};
            let parsedAddress = {};

            try {
                parsedItems = JSON.parse(order.items);
            } catch (err) {
                parsedItems = {};
            }

            try {
                parsedAddress = JSON.parse(order.address);
            } catch (err) {
                parsedAddress = {};
            }

            return {
                ...order,
                items: parsedItems,
                address: parsedAddress,
                payment: order.payment
            };
        });

        return res.json({ success: true, orders: formattedOrders });
    } catch (error) {
        console.error("All Orders Error:", error);
        return res.status(500).json({ success: false, message: "Server error while fetching all orders." });
    }
};

// Update Order Status (Admin)
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({ success: false, message: "Missing order ID or status." });
        }

        const pool = getPool();
        const [result] = await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        return res.json({ success: true, message: "Order status updated successfully!" });
    } catch (error) {
        console.error("Update Status Error:", error);
        return res.status(500).json({ success: false, message: "Server error while updating status." });
    }
};

// Verify Order Payment (User / Frontend simulation - sets status to Awaiting Verification = 2)
const verifyPayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ success: false, message: "Missing order ID." });
        }

        const pool = getPool();
        const [result] = await pool.query("UPDATE orders SET payment = 2 WHERE id = ?", [orderId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        return res.json({ success: true, message: "Payment claim submitted to Admin for verification!" });
    } catch (error) {
        console.error("Verify Payment Error:", error);
        return res.status(500).json({ success: false, message: "Server error while verifying payment." });
    }
};

// Update Order Payment Status manually (Admin control panel - saves 0, 1, or 2)
const updatePayment = async (req, res) => {
    try {
        const { orderId, payment } = req.body;

        if (orderId === undefined || payment === undefined) {
            return res.status(400).json({ success: false, message: "Missing order ID or payment status." });
        }

        const pool = getPool();
        const [result] = await pool.query("UPDATE orders SET payment = ? WHERE id = ?", [Number(payment), orderId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        return res.json({ success: true, message: "Order payment status updated successfully!" });
    } catch (error) {
        console.error("Update Payment Error:", error);
        return res.status(500).json({ success: false, message: "Server error while updating payment status." });
    }
};

// Get active Merchant UPI ID from settings table
const getMerchantUpi = async (req, res) => {
    try {
        const pool = getPool();
        const [rows] = await pool.query("SELECT `value` FROM settings WHERE `key` = 'merchant_upi'");
        
        if (rows.length === 0) {
            return res.json({ success: true, upiId: '6360229741@nyes' }); // Fallback
        }
        
        return res.json({ success: true, upiId: rows[0].value });
    } catch (error) {
        console.error("Get Merchant UPI Error:", error);
        return res.status(500).json({ success: false, message: "Server error while fetching merchant UPI." });
    }
};

// Update active Merchant UPI ID in settings table (Admin)
const updateMerchantUpi = async (req, res) => {
    try {
        const { upiId } = req.body;
        
        if (!upiId) {
            return res.status(400).json({ success: false, message: "Missing UPI ID." });
        }
        
        const pool = getPool();
        await pool.query(
            "INSERT INTO settings (`key`, `value`) VALUES ('merchant_upi', ?) ON DUPLICATE KEY UPDATE `value` = ?",
            [upiId, upiId]
        );
        
        return res.json({ success: true, message: "Merchant UPI ID updated successfully!" });
    } catch (error) {
        console.error("Update Merchant UPI Error:", error);
        return res.status(500).json({ success: false, message: "Server error while updating merchant UPI." });
    }
};

module.exports = { placeOrder, userOrders, allOrders, updateStatus, verifyPayment, updatePayment, getMerchantUpi, updateMerchantUpi };
