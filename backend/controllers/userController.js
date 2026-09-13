const pool = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, username, role, status, created_at FROM users');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching users' });
    }
};

exports.create = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const password_hash = await bcrypt.hash(password, 10);
        
        const [result] = await pool.query(
            'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
            [username, password_hash, role]
        );
        res.status(201).json({ message: 'User created', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error creating user' });
    }
};

exports.update = async (req, res) => {
    try {
        const { role, status } = req.body;
        await pool.query('UPDATE users SET role = ?, status = ? WHERE id = ?', [role, status, req.params.id]);
        res.json({ message: 'User updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error updating user' });
    }
};

exports.delete = async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error deleting user' });
    }
};
