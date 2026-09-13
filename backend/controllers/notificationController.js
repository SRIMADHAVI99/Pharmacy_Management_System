const pool = require('../config/db');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching notifications' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [req.params.id]);
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error updating notification' });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await pool.query('UPDATE notifications SET is_read = TRUE');
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error updating notifications' });
    }
};

exports.generateAlerts = async () => {
    try {
        // Low Stock
        const [lowStock] = await pool.query('SELECT id, name, quantity, min_stock FROM medicines WHERE quantity <= min_stock AND status="Active"');
        for (let med of lowStock) {
            const msg = `${med.name} is low on stock (${med.quantity} remaining).`;
            await pool.query('INSERT IGNORE INTO notifications (title, message, type) VALUES (?, ?, ?)', ['Low Stock', msg, 'Low Stock']);
        }
        
        // Expiring soon (within 30 days)
        const [expiring] = await pool.query('SELECT id, name, expiry_date FROM medicines WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND expiry_date >= CURDATE() AND status="Active"');
        for (let med of expiring) {
            const msg = `${med.name} is expiring on ${med.expiry_date}.`;
            await pool.query('INSERT IGNORE INTO notifications (title, message, type) VALUES (?, ?, ?)', ['Expiring Soon', msg, 'Expiring']);
        }
    } catch (error) {
        console.error('Error generating alerts:', error);
    }
};
