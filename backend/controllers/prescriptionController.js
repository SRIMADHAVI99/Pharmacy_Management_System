const pool = require('../config/db');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.name as customer_name 
            FROM prescriptions p 
            JOIN customers c ON p.customer_id = c.id
            ORDER BY p.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching prescriptions' });
    }
};

exports.getById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM prescriptions WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Prescription not found' });
        
        const [items] = await pool.query(`
            SELECT pi.*, m.name as medicine_name 
            FROM prescription_items pi
            JOIN medicines m ON pi.medicine_id = m.id
            WHERE pi.prescription_id = ?
        `, [req.params.id]);
        
        const prescription = rows[0];
        prescription.items = items;
        res.json(prescription);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching prescription' });
    }
};

exports.create = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { customer_id, doctor_name, prescription_date, expiry_date, items } = req.body;
        const imageUrl = req.file ? `/uploads/prescriptions/${req.file.filename}` : null;
        
        if (!customer_id || !doctor_name || !prescription_date) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const [result] = await connection.query(
            'INSERT INTO prescriptions (customer_id, doctor_name, prescription_date, expiry_date, image_url) VALUES (?, ?, ?, ?, ?)',
            [customer_id, doctor_name, prescription_date, expiry_date || null, imageUrl]
        );
        const prescriptionId = result.insertId;

        if (items) {
            const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
            for (let item of parsedItems) {
                await connection.query(
                    'INSERT INTO prescription_items (prescription_id, medicine_id, dosage_instructions) VALUES (?, ?, ?)',
                    [prescriptionId, item.medicine_id, item.dosage_instructions]
                );
            }
        }
        await connection.commit();
        res.status(201).json({ message: 'Prescription created', id: prescriptionId });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Server error creating prescription' });
    } finally {
        connection.release();
    }
};

exports.verify = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Verified', 'Rejected', 'Dispensed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        await pool.query(
            'UPDATE prescriptions SET verification_status = ?, verified_by = ? WHERE id = ?',
            [status, req.user.id, req.params.id]
        );
        res.json({ message: 'Prescription status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error updating prescription' });
    }
};
