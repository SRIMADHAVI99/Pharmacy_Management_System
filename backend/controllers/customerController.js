const pool = require('../config/db');

const getCustomers = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM customers');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getCustomerById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const createCustomer = async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;
        const [result] = await pool.query(
            'INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)',
            [name, phone, email, address]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const updateCustomer = async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;
        await pool.query(
            'UPDATE customers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?',
            [name, phone, email, address, req.params.id]
        );
        res.json({ message: 'Updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        await pool.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
