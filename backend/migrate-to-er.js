const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Reuse the asset parser to populate products under the new schema
function parseProductsFromAssets() {
    try {
        const assetsPath = path.join(__dirname, '../frontend/src/assets/assets.js');
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
            const cleanedText = arrayText.replace(/p_img\d+(_\d+)?/g, '"$&"');
            const tempFunc = new Function(`return ${cleanedText}`);
            return tempFunc();
        }
    } catch (error) {
        console.error("Error reading/parsing frontend assets:", error);
        return [];
    }
}

async function runMigration() {
    let connection;
    try {
        const dbName = process.env.DB_NAME || 'add2cart';
        console.log(`Connecting to MySQL to migrate database: ${dbName}...`);
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        // Ensure database exists and target it
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await connection.query(`USE \`${dbName}\``);

        console.log("Dropping existing tables to prevent foreign key or duplicate index clashes...");
        await connection.query("SET FOREIGN_KEY_CHECKS = 0");
        const tablesToDrop = [
            'wishlist', 'review', 'payment', 'order_item', 'order',
            'cart_item', 'cart', 'payment_method', 'address',
            'product', 'category', 'user', 'settings'
        ];
        for (const tbl of tablesToDrop) {
            await connection.query(`DROP TABLE IF EXISTS \`${tbl}\``);
        }
        await connection.query("SET FOREIGN_KEY_CHECKS = 1");

        console.log("Creating 12 ER Diagram tables...");

        // 1. USER TABLE
        await connection.query(`
            CREATE TABLE user (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20) DEFAULT NULL,
                gender VARCHAR(15) DEFAULT NULL,
                date_of_birth DATE DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 2. CATEGORY TABLE
        await connection.query(`
            CREATE TABLE category (
                category_id INT AUTO_INCREMENT PRIMARY KEY,
                category_name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT DEFAULT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 3. PRODUCT TABLE
        await connection.query(`
            CREATE TABLE product (
                product_id VARCHAR(50) PRIMARY KEY,
                category_id INT NOT NULL,
                product_name VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                discount DECIMAL(5, 2) DEFAULT 0.00,
                stock_quantity INT NOT NULL DEFAULT 100,
                image_url LONGTEXT NOT NULL,
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_product_category 
                    FOREIGN KEY (category_id) REFERENCES category (category_id) 
                    ON DELETE RESTRICT ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 4. ADDRESS TABLE
        await connection.query(`
            CREATE TABLE address (
                address_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                type VARCHAR(50) NOT NULL DEFAULT 'Shipping',
                address_line1 VARCHAR(255) NOT NULL,
                address_line2 VARCHAR(255) DEFAULT NULL,
                city VARCHAR(100) NOT NULL,
                state VARCHAR(100) NOT NULL,
                postal_code VARCHAR(20) NOT NULL,
                country VARCHAR(100) NOT NULL,
                is_default TINYINT(1) DEFAULT 0,
                CONSTRAINT fk_address_user 
                    FOREIGN KEY (user_id) REFERENCES user (user_id) 
                    ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 5. PAYMENT_METHOD TABLE
        await connection.query(`
            CREATE TABLE payment_method (
                payment_method_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                card_holder_name VARCHAR(255) DEFAULT NULL,
                card_number VARCHAR(30) DEFAULT NULL,
                expiry_date VARCHAR(10) DEFAULT NULL,
                cvv VARCHAR(4) DEFAULT NULL,
                type VARCHAR(50) NOT NULL,
                is_default TINYINT(1) DEFAULT 0,
                CONSTRAINT fk_payment_method_user 
                    FOREIGN KEY (user_id) REFERENCES user (user_id) 
                    ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 6. CART TABLE (1:1 Relationship with User)
        await connection.query(`
            CREATE TABLE cart (
                cart_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_cart_user 
                    FOREIGN KEY (user_id) REFERENCES user (user_id) 
                    ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 7. CART_ITEM TABLE
        await connection.query(`
            CREATE TABLE cart_item (
                cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
                cart_id INT NOT NULL,
                product_id VARCHAR(50) NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uk_cart_product (cart_id, product_id),
                CONSTRAINT fk_cart_item_cart 
                    FOREIGN KEY (cart_id) REFERENCES cart (cart_id) 
                    ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT fk_cart_item_product 
                    FOREIGN KEY (product_id) REFERENCES product (product_id) 
                    ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 8. ORDER TABLE
        await connection.query(`
            CREATE TABLE \`order\` (
                order_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                address_id INT NOT NULL,
                order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                order_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
                total_amount DECIMAL(10, 2) NOT NULL,
                CONSTRAINT fk_order_user 
                    FOREIGN KEY (user_id) REFERENCES user (user_id) 
                    ON DELETE RESTRICT ON UPDATE CASCADE,
                CONSTRAINT fk_order_address 
                    FOREIGN KEY (address_id) REFERENCES address (address_id) 
                    ON DELETE RESTRICT ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 9. ORDER_ITEM TABLE
        await connection.query(`
            CREATE TABLE order_item (
                order_item_id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id VARCHAR(50) NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                price DECIMAL(10, 2) NOT NULL,
                discount DECIMAL(5, 2) DEFAULT 0.00,
                CONSTRAINT fk_order_item_order 
                    FOREIGN KEY (order_id) REFERENCES \`order\` (order_id) 
                    ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT fk_order_item_product 
                    FOREIGN KEY (product_id) REFERENCES product (product_id) 
                    ON DELETE RESTRICT ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 10. PAYMENT TABLE
        await connection.query(`
            CREATE TABLE payment (
                payment_id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                payment_method_id INT DEFAULT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
                payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                transaction_id VARCHAR(100) UNIQUE DEFAULT NULL,
                CONSTRAINT fk_payment_order 
                    FOREIGN KEY (order_id) REFERENCES \`order\` (order_id) 
                    ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT fk_payment_method 
                    FOREIGN KEY (payment_method_id) REFERENCES payment_method (payment_method_id) 
                    ON DELETE SET NULL ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 11. REVIEW TABLE
        await connection.query(`
            CREATE TABLE review (
                review_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id VARCHAR(50) NOT NULL,
                rating INT NOT NULL,
                comment TEXT DEFAULT NULL,
                review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT chk_review_rating CHECK (rating BETWEEN 1 AND 5),
                CONSTRAINT fk_review_user 
                    FOREIGN KEY (user_id) REFERENCES user (user_id) 
                    ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT fk_review_product 
                    FOREIGN KEY (product_id) REFERENCES product (product_id) 
                    ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 12. WISHLIST TABLE
        await connection.query(`
            CREATE TABLE wishlist (
                wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id VARCHAR(50) NOT NULL,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uk_user_wishlist (user_id, product_id),
                CONSTRAINT fk_wishlist_user 
                    FOREIGN KEY (user_id) REFERENCES user (user_id) 
                    ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT fk_wishlist_product 
                    FOREIGN KEY (product_id) REFERENCES product (product_id) 
                    ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // Also add the custom settings table that you use for merchant details
        await connection.query(`
            CREATE TABLE IF NOT EXISTS settings (
                \`key\` VARCHAR(100) PRIMARY KEY,
                \`value\` VARCHAR(255) NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        console.log("Seeding settings configurations...");
        await connection.query("INSERT IGNORE INTO settings (\`key\`, \`value\`) VALUES ('merchant_upi', '6360229741@nyes')");

        console.log("Seeding Category records...");
        const categories = ['Fashion', 'Electronics', 'Home', 'Sports', 'Beauty', 'Books', 'Toys', 'Fitness', 'Groceries', 'Men', 'Women', 'Kids', 'Items'];
        const catMap = {}; // Will hold category_name -> category_id mapping
        for (const catName of categories) {
            const [res] = await connection.query("INSERT INTO category (category_name, description) VALUES (?, ?)", [catName, `All items belonging to ${catName} section.`]);
            catMap[catName] = res.insertId;
        }

        console.log("Seeding Product records from storefront assets...");
        const products = parseProductsFromAssets();
        if (products && products.length > 0) {
            for (const item of products) {
                // Map frontend category name to newly inserted category_id
                const categoryName = item.category || 'Items';
                const categoryId = catMap[categoryName] || catMap['Items'];

                // Reroute category to items catalog
                const imgVal = Array.isArray(item.image) ? JSON.stringify(item.image) : JSON.stringify([item.image || 'p_img1']);

                await connection.query(
                    `INSERT INTO product (product_id, category_id, product_name, description, price, discount, stock_quantity, image_url, is_active)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        item._id,
                        categoryId,
                        item.name,
                        item.description,
                        item.price,
                        0.00,
                        120, // default quantity
                        imgVal, // serialized catalog references
                        1
                    ]
                );
            }
            console.log(`Successfully seeded ${products.length} products mapping to category constraints.`);
        } else {
            console.log("No products found in assets to seed.");
        }

        console.log("\n=========================================================");
        console.log("✅ DATABASE SCHEMA MIGRATION SUCCESSFUL!");
        console.log(`All 12 tables from the ER Diagram are created in: ${dbName}`);
        console.log("=========================================================\n");

    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        if (connection) {
            await connection.end();
        }
        process.exit(0);
    }
}

runMigration();
