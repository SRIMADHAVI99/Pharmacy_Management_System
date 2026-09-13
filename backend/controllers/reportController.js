const pool = require('../config/db');

exports.getSalesReport = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        let query = `
            SELECT DATE(sale_date) as date, SUM(total) as daily_total, COUNT(id) as sale_count 
            FROM sales 
        `;
        let topMedicinesQuery = `
            SELECT m.name, SUM(si.quantity) as total_quantity_sold, SUM(si.total_price) as total_revenue
            FROM sale_items si
            JOIN sales s ON si.sale_id = s.id
            JOIN medicines m ON si.medicine_id = m.id
        `;
        const params = [];
        if (start_date && end_date) {
            query += ` WHERE DATE(sale_date) BETWEEN ? AND ? `;
            topMedicinesQuery += ` WHERE DATE(s.sale_date) BETWEEN ? AND ? `;
            params.push(start_date, end_date);
        }
        query += ` GROUP BY DATE(sale_date) ORDER BY date ASC`;
        topMedicinesQuery += ` GROUP BY m.id ORDER BY total_quantity_sold DESC LIMIT 10`;
        
        const [daily] = await pool.query(query, params);
        
        const topParams = start_date && end_date ? [start_date, end_date] : [];
        const [topSelling] = await pool.query(topMedicinesQuery, topParams);

        let totalRevenue = 0;
        let totalSales = 0;
        daily.forEach(d => {
            totalRevenue += Number(d.daily_total);
            totalSales += Number(d.sale_count);
        });

        res.json({ daily, topSelling, totalRevenue, totalSales });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error generating sales report' });
    }
};

exports.getInventoryReport = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT id, name, category, quantity, min_stock, purchase_price, selling_price, 
            (quantity * purchase_price) as total_value, expiry_date, status
            FROM medicines
            ORDER BY quantity ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error generating inventory report' });
    }
};

exports.getPurchaseReport = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        let query = `
            SELECT p.id, p.purchase_date, p.total_amount, s.name as supplier_name 
            FROM purchases p
            JOIN suppliers s ON p.supplier_id = s.id
        `;
        const params = [];
        if (start_date && end_date) {
            query += ` WHERE DATE(p.purchase_date) BETWEEN ? AND ? `;
            params.push(start_date, end_date);
        }
        query += ` ORDER BY p.purchase_date DESC`;
        
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error generating purchase report' });
    }
};
