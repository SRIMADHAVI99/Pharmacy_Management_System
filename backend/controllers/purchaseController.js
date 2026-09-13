const pool = require('../config/db');

const createPurchase = async (req, res) => {
    const { supplier_id, items } = req.body;
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        let totalAmount = 0;
        for (const item of items) {
            totalAmount += item.quantity * item.purchase_price;
        }
        
        const user_id = req.user.id;
        const [purchaseResult] = await connection.query(
            'INSERT INTO purchases (supplier_id, user_id, total_amount, purchase_date) VALUES (?, ?, ?, NOW())',
            [supplier_id, user_id, totalAmount]
        );
        const purchaseId = purchaseResult.insertId;
        
        for (const item of items) {
            const { medicine_id, batch_number, quantity, purchase_price, expiry_date } = item;
            
            await connection.query('UPDATE medicines SET quantity = quantity + ? WHERE id = ?', [quantity, medicine_id]);
            
            await connection.query(
                'INSERT INTO purchase_items (purchase_id, medicine_id, batch_number, quantity, purchase_price, expiry_date, total_price) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [purchaseId, medicine_id, batch_number, quantity, purchase_price, expiry_date, quantity * purchase_price]
            );
            
            await connection.query(
                'INSERT INTO inventory_transactions (medicine_id, type, quantity, reference_type, reference_id, user_id, transaction_date) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [medicine_id, 'IN', quantity, 'Purchase', purchaseId, user_id]
            );
        }
        
        await connection.commit();
        res.status(201).json({ message: 'Purchase completed', purchaseId });
        
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(400).json({ error: 'Transaction failed' });
    } finally {
        connection.release();
    }
};

const getPurchases = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM purchases');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { createPurchase, getPurchases };
