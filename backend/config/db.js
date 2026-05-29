const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let pool;

// Parse the frontend assets.js file to extract and format products
function parseProductsFromAssets() {
    try {
        const assetsPath = path.join(__dirname, '../../frontend/src/assets/assets.js');
        if (!fs.existsSync(assetsPath)) {
            console.log("Frontend assets.js not found at:", assetsPath);
            return [];
        }

        const text = fs.readFileSync(assetsPath, 'utf-8');
        const startIdx = text.indexOf('export const products = [');
        if (startIdx === -1) {
            console.log("Could not find products array in assets.js");
            return [];
        }

        let arrayText = text.substring(startIdx + 'export const products = '.length);
        let bracketCount = 0;
        let endIdx = 0;
        for (let i = 0; i < arrayText.length; i++) {
            if (arrayText[i] === '[') bracketCount++;
            else if (arrayText[i] === ']') {
                bracketCount--;
                if (bracketCount === 0) {
                    endIdx = i;
                    break;
                }
            }
        }
        arrayText = arrayText.substring(0, endIdx + 1);

        // Convert image: [p_img...] to image: ["p_img..."]
        arrayText = arrayText.replace(/image:\s*\[([^\]]+)\]/g, (match, p1) => {
            const imgs = p1.split(',').map(s => `"${s.trim()}"`).join(',');
            return `image: [${imgs}]`;
        });

        // Wrap unquoted keys in double quotes for JSON parsing
        arrayText = arrayText.replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":');

        // Remove trailing commas in objects/arrays
        arrayText = arrayText.replace(/,\s*([}\]])/g, '$1');

        try {
            return JSON.parse(arrayText);
        } catch (e) {
            // Safe fallback evaluator for local dev setup if JSON parsing fails
            const cleanedText = arrayText.replace(/p_img\d+(_\d+)?/g, '"$&"');
            const tempFunc = new Function(`return ${cleanedText}`);
            return tempFunc();
        }
    } catch (error) {
        console.error("Error reading/parsing frontend assets:", error);
        return [];
    }
}

async function connectDB() {
    if (pool) return pool;

    try {
        // First connect without specifying the database to ensure it exists
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        const dbName = process.env.DB_NAME || 'add2cart';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await connection.end();

        // Create connection pool targeting the add2cart database
        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: dbName,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        console.log(`Connected to MySQL Database: ${dbName}`);
        
        // Initialize tables
        await initializeTables();

        return pool;
    } catch (error) {
        console.error("MySQL connection error:", error);
        process.exit(1);
    }
}

async function initializeTables() {
    try {
        // Users Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Products Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                price INT NOT NULL,
                image LONGTEXT NOT NULL,
                category VARCHAR(100) NOT NULL,
                subCategory VARCHAR(100) NOT NULL,
                sizes TEXT NOT NULL,
                date BIGINT NOT NULL,
                bestseller TINYINT(1) DEFAULT 0
            )
        `);

        // Safely alter existing table column if it was previously created as TEXT
        try {
            await pool.query("ALTER TABLE products MODIFY COLUMN image LONGTEXT NOT NULL");
            console.log("MySQL 'products.image' column verified/updated to LONGTEXT successfully.");
        } catch (alterError) {
            console.warn("Could not alter products.image column to LONGTEXT (it may already be upgraded or table is locked):", alterError.message);
        }

        // Cart Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS cart (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id VARCHAR(50) NOT NULL,
                size VARCHAR(10) NOT NULL,
                quantity INT NOT NULL,
                UNIQUE KEY user_product_size (user_id, product_id, size),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `);

        // Orders Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                items TEXT NOT NULL,
                amount INT NOT NULL,
                address TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'Order Placed',
                paymentMethod VARCHAR(50) DEFAULT 'COD',
                payment TINYINT(1) DEFAULT 0,
                date BIGINT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Reviews Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id VARCHAR(50) NOT NULL,
                user_name VARCHAR(255) NOT NULL,
                rating INT NOT NULL,
                comment TEXT NOT NULL,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `);

        // Settings Table to store key-value configurations (like active merchant UPI ID)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS settings (
                \`key\` VARCHAR(100) PRIMARY KEY,
                \`value\` VARCHAR(255) NOT NULL
            )
        `);

        // Seed default merchant UPI ID if not already registered
        await pool.query("INSERT IGNORE INTO settings (\`key\`, \`value\`) VALUES ('merchant_upi', '6360229741@nyes')");

        // Auto-seed products if products table is empty
        const [rows] = await pool.query("SELECT COUNT(*) as count FROM products");
        if (rows[0].count === 0) {
            console.log("Products table is empty. Seeding products from assets...");
            const products = parseProductsFromAssets();
            if (products && products.length > 0) {
                for (const item of products) {
                    await pool.query(
                        `INSERT INTO products (id, name, description, price, image, category, subCategory, sizes, date, bestseller)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            item._id,
                            item.name,
                            item.description,
                            item.price,
                            JSON.stringify(item.image),
                            item.category,
                            item.subCategory,
                            JSON.stringify(item.sizes),
                            item.date,
                            item.bestseller ? 1 : 0
                        ]
                    );
                }
                console.log(`Successfully seeded ${products.length} products to database.`);
            } else {
                console.log("No products found to seed.");
            }
        }

    } catch (error) {
        console.error("Error creating tables or seeding products:", error);
    }
}

module.exports = { connectDB, getPool: () => pool };
