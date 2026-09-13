const pool = require('../config/db');

const getMedicines = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT m.*, s.name as supplier_name 
            FROM medicines m 
            LEFT JOIN suppliers s ON m.supplier_id = s.id
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getMedicineById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM medicines WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const createMedicine = async (req, res) => {
    try {
        const { 
            name, generic_name, category, manufacturer, batch_number, 
            dosage, form, purchase_price, selling_price, quantity, 
            min_stock, expiry_date, requires_prescription, supplier_id 
        } = req.body;
        
        const [result] = await pool.query(
            `INSERT INTO medicines (
                name, generic_name, category, manufacturer, batch_number, 
                dosage, form, purchase_price, selling_price, quantity, 
                min_stock, expiry_date, requires_prescription, supplier_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name, generic_name, category, manufacturer || null, batch_number, 
                dosage || null, form || null, purchase_price, selling_price, quantity, 
                min_stock, expiry_date, requires_prescription ? 1 : 0, supplier_id || null
            ]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateMedicine = async (req, res) => {
    try {
        const { 
            name, generic_name, category, manufacturer, batch_number, 
            dosage, form, purchase_price, selling_price, quantity, 
            min_stock, expiry_date, requires_prescription, supplier_id 
        } = req.body;
        
        await pool.query(
            `UPDATE medicines SET 
                name = ?, generic_name = ?, category = ?, manufacturer = ?, batch_number = ?, 
                dosage = ?, form = ?, purchase_price = ?, selling_price = ?, quantity = ?, 
                min_stock = ?, expiry_date = ?, requires_prescription = ?, supplier_id = ?
             WHERE id = ?`,
            [
                name, generic_name, category, manufacturer || null, batch_number, 
                dosage || null, form || null, purchase_price, selling_price, quantity, 
                min_stock, expiry_date, requires_prescription ? 1 : 0, supplier_id || null,
                req.params.id
            ]
        );
        res.json({ message: 'Updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const deleteMedicine = async (req, res) => {
    try {
        await pool.query('DELETE FROM medicines WHERE id = ?', [req.params.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getMedicines, getMedicineById, createMedicine, updateMedicine, deleteMedicine };
