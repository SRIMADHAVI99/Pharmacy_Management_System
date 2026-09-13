const pool = require('../config/db');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const createSale = async (req, res) => {
    const { customer_id, items, payment_method, discount, tax } = req.body;
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        let totalAmount = 0;
        
        for (const item of items) {
            const { medicine_id, quantity, unit_price } = item;
            
            const [medRows] = await connection.query('SELECT name, quantity, expiry_date, requires_prescription FROM medicines WHERE id = ? FOR UPDATE', [medicine_id]);
            if (medRows.length === 0 || medRows[0].quantity < quantity) {
                throw new Error(`Insufficient stock for medicine ID ${medicine_id}`);
            }
            if (new Date(medRows[0].expiry_date) < new Date()) {
                throw new Error(`Medicine ${medRows[0].name} is expired and cannot be sold.`);
            }
            if (medRows[0].requires_prescription) {
                // If it requires a prescription, for this simplified system, we could just check if the request provided a valid prescription ID or just assume the frontend checked it.
                // The prompt says "Prescription-required medicine is handled correctly". Let's assume frontend passes a prescription_id if it's required, or we just rely on frontend validation if we don't have prescription_id in the sale items. Wait, the schema doesn't link sales to prescriptions directly. 
                // Let's at least enforce the check if the frontend is supposed to validate it, or we could add a warning. 
                // Wait, if we enforce it here without the frontend sending something, it will block sales.
                // Let's rely on frontend for the prescription check, or just add a flag `prescription_verified` to the payload.
                if (!item.prescription_verified) {
                    throw new Error(`Medicine ${medRows[0].name} requires a verified prescription.`);
                }
            }
            
            totalAmount += quantity * unit_price;
        }
        
        const parsedDiscount = parseFloat(discount) || 0;
        const parsedTax = parseFloat(tax) || 0;
        const finalAmount = totalAmount - parsedDiscount + parsedTax;
        const invoice_number = 'INV-' + Date.now();
        const user_id = req.user.id;
        
        const [saleResult] = await connection.query(
            'INSERT INTO sales (invoice_number, customer_id, user_id, subtotal, tax, discount, total, payment_method, sale_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
            [invoice_number, customer_id, user_id, totalAmount, parsedTax, parsedDiscount, finalAmount, payment_method]
        );
        const saleId = saleResult.insertId;
        
        const invoiceFileName = `invoice_${saleId}.pdf`;
        const invoicePath = path.join(__dirname, '../uploads/invoices', invoiceFileName);
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(invoicePath));
        doc.fontSize(20).text('Invoice', { align: 'center' });
        doc.fontSize(12).text(`Sale ID: ${saleId}`);
        doc.text(`Customer ID: ${customer_id}`);
        doc.text(`Date: ${new Date().toLocaleString()}`);
        doc.text('-----------------------------------');
        
        for (const item of items) {
            const { medicine_id, quantity, unit_price } = item;
            
            await connection.query('UPDATE medicines SET quantity = quantity - ? WHERE id = ?', [quantity, medicine_id]);
            
            await connection.query(
                'INSERT INTO sale_items (sale_id, medicine_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
                [saleId, medicine_id, quantity, unit_price, quantity * unit_price]
            );
            
            await connection.query(
                'INSERT INTO inventory_transactions (medicine_id, type, quantity, reference_type, reference_id, user_id, transaction_date) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [medicine_id, 'OUT', quantity, 'Sale', saleId, user_id]
            );
            
            doc.text(`Medicine ID: ${medicine_id} | Qty: ${quantity} | Price: $${unit_price}`);
        }
        
        doc.text('-----------------------------------');
        doc.text(`Discount: $${discount || 0}`);
        doc.text(`Tax: $${tax || 0}`);
        doc.text(`Total Amount: $${finalAmount}`);
        doc.end();
        
        const invoice_url = `/uploads/invoices/${invoiceFileName}`;
        
        await connection.commit();
        
        // Generate alerts
        try {
            const notificationController = require('./notificationController');
            await notificationController.generateAlerts();
        } catch(e) { console.error('Alerts error', e); }

        res.status(201).json({ message: 'Sale completed', saleId, invoice_url });
        
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(400).json({ error: error.message || 'Transaction failed' });
    } finally {
        connection.release();
    }
};

const getSales = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM sales');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getSaleById = async (req, res) => {
    try {
        const [sales] = await pool.query('SELECT * FROM sales WHERE id = ?', [req.params.id]);
        if (sales.length === 0) return res.status(404).json({ error: 'Not found' });
        
        const [items] = await pool.query('SELECT * FROM sale_items WHERE sale_id = ?', [req.params.id]);
        res.json({ ...sales[0], items });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const downloadInvoice = async (req, res) => {
    try {
        const [sales] = await pool.query('SELECT invoice_url FROM sales WHERE id = ?', [req.params.id]);
        if (sales.length === 0 || !sales[0].invoice_url) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        const filePath = path.join(__dirname, '..', sales[0].invoice_url);
        res.download(filePath);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { createSale, getSales, getSaleById, downloadInvoice };
