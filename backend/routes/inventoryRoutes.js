const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

router.get('/transactions', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM inventory_transactions ORDER BY transaction_date DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
