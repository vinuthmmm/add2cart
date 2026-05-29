const { connectDB, getPool } = require('./config/db');

async function togglePrice() {
    try {
        // Connect to database
        await connectDB();
        const pool = getPool();

        // 1. Fetch the current price of the first product
        const [rows] = await pool.query('SELECT price FROM products WHERE id = "aaaaa"');
        if (rows.length === 0) {
            console.log("❌ Product 'aaaaa' not found in database.");
            process.exit(1);
        }

        const currentPrice = rows[0].price;

        // 2. Toggle the price: if 100, set to 999; otherwise, set to 100
        const newPrice = currentPrice === 100 ? 999 : 100;

        // 3. Update the price in MySQL
        await pool.query('UPDATE products SET price = ? WHERE id = "aaaaa"', [newPrice]);

        console.log('================================================================');
        console.log(`✅ DATABASE UPDATE SUCCESSFUL!`);
        console.log(`Product "Women Round Neck Cotton Top" price toggled: ₹${currentPrice} ➔ ₹${newPrice}`);
        console.log('----------------------------------------------------------------');
        console.log(`👉 Step 1: Open your browser and refresh your website http://localhost:5173`);
        console.log(`👉 Step 2: See the first product price change!`);
        console.log(`👉 Step 3: Run "node test-db.js" again in this terminal to toggle it back.`);
        console.log('================================================================');

        process.exit(0);
    } catch (error) {
        console.error("❌ Toggle Price Error:", error);
        process.exit(1);
    }
}

togglePrice();
