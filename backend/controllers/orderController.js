const pool = require('../config/db');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT o.*, c.name as customer_name 
            FROM orders o 
            JOIN customers c ON o.customer_id = c.id
            ORDER BY o.order_date DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching orders' });
    }
};

exports.getById = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT o.*, c.name as customer_name, c.phone, c.address 
            FROM orders o 
            JOIN customers c ON o.customer_id = c.id
            WHERE o.id = ?
        `, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        
        const [items] = await pool.query(`
            SELECT oi.*, m.name as medicine_name 
            FROM order_items oi
            JOIN medicines m ON oi.medicine_id = m.id
            WHERE oi.order_id = ?
        `, [req.params.id]);
        
        const order = rows[0];
        order.items = items;
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching order' });
    }
};

exports.create = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { customer_id, items, total_amount, payment_status } = req.body;
        
        const [result] = await connection.query(
            'INSERT INTO orders (customer_id, total_amount, payment_status) VALUES (?, ?, ?)',
            [customer_id, total_amount, payment_status || 'Pending']
        );
        const orderId = result.insertId;

        for (let item of items) {
            await connection.query(
                'INSERT INTO order_items (order_id, medicine_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.medicine_id, item.quantity, item.unit_price, item.total_price]
            );
            
            // Orders do not reduce stock until they are marked as 'Completed' or 'Ready', but for this system 
            // if we want to reserve it we might need another transaction. For simplicity, we just create the order.
        }
        await connection.commit();
        res.status(201).json({ message: 'Order created', id: orderId });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Server error creating order' });
    } finally {
        connection.release();
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Order status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error updating order status' });
    }
};
