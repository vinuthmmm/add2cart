const { connectDB, getPool } = require('./config/db');

async function viewDatabase() {
    try {
        await connectDB();
        const pool = getPool();

        console.log('\n================================================================');
        console.log('📊 DATABASE STATUS SUMMARY (add2cart)');
        console.log('================================================================\n');

        // 1. Fetch Products count
        const [products] = await pool.query('SELECT COUNT(*) as count FROM products');
        console.log(`🛍️  PRODUCTS: ${products[0].count} items seeded in catalog.`);

        // 2. Fetch Users
        const [users] = await pool.query('SELECT id, name, email, created_at FROM users');
        console.log(`\n👤 REGISTERED USERS (${users.length}):`);
        if (users.length === 0) {
            console.log('   (No users registered yet. Go to the login page and sign up!)');
        } else {
            console.table(users.map(u => ({
                ID: u.id,
                Name: u.name,
                Email: u.email,
                'Joined Date': new Date(u.created_at).toLocaleDateString()
            })));
        }

        // 3. Fetch Cart Items
        const [cart] = await pool.query(`
            SELECT cart.user_id, users.name as user_name, cart.product_id, products.name as product_name, cart.size, cart.quantity 
            FROM cart 
            JOIN users ON cart.user_id = users.id 
            JOIN products ON cart.product_id = products.id
        `);
        console.log(`\n🛒 ACTIVE USER CARTS (${cart.length} unique items):`);
        if (cart.length === 0) {
            console.log('   (All user carts are empty. Log in, add products to cart, and reload!)');
        } else {
            console.table(cart.map(c => ({
                User: c.user_name,
                Product: c.product_name.substring(0, 30) + '...',
                Size: c.size,
                Qty: c.quantity
            })));
        }

        // 4. Fetch Orders
        const [orders] = await pool.query(`
            SELECT orders.id, users.name as user_name, orders.amount, orders.status, orders.paymentMethod, orders.date 
            FROM orders 
            JOIN users ON orders.user_id = users.id
        `);
        console.log(`\n📦 PLACED ORDERS (${orders.length}):`);
        if (orders.length === 0) {
            console.log('   (No orders placed yet. Proceed to checkout, place order, and reload!)');
        } else {
            console.table(orders.map(o => ({
                'Order ID': o.id,
                Customer: o.user_name,
                Amount: `₹${o.amount}`,
                Status: o.status,
                Method: o.paymentMethod.toUpperCase(),
                Date: new Date(Number(o.date)).toLocaleDateString()
            })));
        }

        console.log('\n================================================================');
        process.exit(0);
    } catch (error) {
        console.error("❌ Error viewing database:", error);
        process.exit(1);
    }
}

viewDatabase();
