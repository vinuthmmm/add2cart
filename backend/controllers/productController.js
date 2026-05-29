const { getPool } = require('../config/db');

// Get all products list
const listProducts = async (req, res) => {
    try {
        const pool = getPool();
        const [products] = await pool.query("SELECT * FROM products");

        // Parse JSON fields (image, sizes) for each product
        const formattedProducts = products.map((product) => {
            let parsedImages = [];
            let parsedSizes = [];

            try {
                parsedImages = JSON.parse(product.image);
            } catch (err) {
                parsedImages = [product.image];
            }

            try {
                parsedSizes = JSON.parse(product.sizes);
            } catch (err) {
                parsedSizes = [];
            }

            return {
                ...product,
                _id: product.id, // Map 'id' to '_id' for frontend compatibility
                image: parsedImages,
                sizes: parsedSizes,
                bestseller: product.bestseller === 1 // Convert to boolean
            };
        });

        return res.json({ success: true, products: formattedProducts });
    } catch (error) {
        console.error("List Products Error:", error);
        return res.status(500).json({ success: false, message: "Server error while fetching products list." });
    }
};

// Get single product details
const singleProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = getPool();
        const [products] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);

        if (products.length === 0) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        const product = products[0];

        let parsedImages = [];
        let parsedSizes = [];

        try {
            parsedImages = JSON.parse(product.image);
        } catch (err) {
            parsedImages = [product.image];
        }

        try {
            parsedSizes = JSON.parse(product.sizes);
        } catch (err) {
            parsedSizes = [];
        }

        const formattedProduct = {
            ...product,
            _id: product.id,
            image: parsedImages,
            sizes: parsedSizes,
            bestseller: product.bestseller === 1
        };

        return res.json({ success: true, product: formattedProduct });
    } catch (error) {
        console.error("Single Product Error:", error);
        return res.status(500).json({ success: false, message: "Server error while fetching product details." });
    }
};

// Add a new product to MySQL (Admin)
const addProduct = async (req, res) => {
    try {
        const { name, description, price, image, category, subCategory, sizes, bestseller } = req.body;

        if (!name || !description || !price || !category || !subCategory || !sizes) {
            return res.status(400).json({ success: false, message: "Missing required product fields." });
        }

        const pool = getPool();

        // Generate a unique ID (short unique hash)
        const id = 'prod_' + Math.random().toString(36).substring(2, 9);
        const date = Date.now();

        // Serialize array fields as JSON
        const sizesJson = Array.isArray(sizes) ? JSON.stringify(sizes) : JSON.stringify([sizes]);
        const imageJson = Array.isArray(image) ? JSON.stringify(image) : JSON.stringify([image || 'p_img1']);

        await pool.query(
            `INSERT INTO products (id, name, description, price, image, category, subCategory, sizes, date, bestseller)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                name,
                description,
                Number(price),
                imageJson,
                category,
                subCategory,
                sizesJson,
                date,
                bestseller ? 1 : 0
            ]
        );

        return res.status(201).json({ success: true, message: "Product Added Successfully!" });
    } catch (error) {
        console.error("Add Product Error:", error);
        return res.status(500).json({ success: false, message: "Server error while adding product." });
    }
};

// Remove a product from MySQL (Admin)
const removeProduct = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Missing product ID." });
        }

        const pool = getPool();
        const [result] = await pool.query("DELETE FROM products WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Product not found or already deleted." });
        }

        return res.json({ success: true, message: "Product Removed Successfully!" });
    } catch (error) {
        console.error("Remove Product Error:", error);
        return res.status(500).json({ success: false, message: "Server error while removing product." });
    }
};

module.exports = { listProducts, singleProduct, addProduct, removeProduct };
