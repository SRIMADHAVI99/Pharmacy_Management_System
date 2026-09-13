const pool = require('../config/db');

const getSuppliers = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM suppliers');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getSupplierById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const createSupplier = async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;
        const [result] = await pool.query(
            'INSERT INTO suppliers (name, phone, email, address) VALUES (?, ?, ?, ?)',
            [name, phone, email, address]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const updateSupplier = async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;
        await pool.query(
            'UPDATE suppliers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?',
            [name, phone, email, address, req.params.id]
        );
        res.json({ message: 'Updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const deleteSupplier = async (req, res) => {
    try {
        await pool.query('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier };
