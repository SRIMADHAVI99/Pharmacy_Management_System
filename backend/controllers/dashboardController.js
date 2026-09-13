const pool = require('../config/db');

const getStats = async (req, res) => {
    try {
        const [[{ total_medicines }]] = await pool.query('SELECT COUNT(*) as total_medicines FROM medicines');
        const [[{ total_customers }]] = await pool.query('SELECT COUNT(*) as total_customers FROM customers');
        const [[{ total_suppliers }]] = await pool.query('SELECT COUNT(*) as total_suppliers FROM suppliers');
        
        const [[{ todays_sales }]] = await pool.query('SELECT COUNT(*) as todays_sales FROM sales WHERE DATE(sale_date) = CURDATE()');
        const [[{ todays_revenue }]] = await pool.query('SELECT SUM(total) as todays_revenue FROM sales WHERE DATE(sale_date) = CURDATE()');
        
        const [[{ low_stock_count }]] = await pool.query('SELECT COUNT(*) as low_stock_count FROM medicines WHERE quantity <= min_stock');
        // Expiring could be checked via purchase_items but let's assume a simplified version
        const [[{ expiring_count }]] = await pool.query('SELECT COUNT(*) as expiring_count FROM medicines WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)');

        res.json({
            total_medicines,
            total_customers,
            total_suppliers,
            todays_sales,
            todays_revenue: todays_revenue || 0,
            low_stock_count,
            expiring_count
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getCharts = async (req, res) => {
    try {
        const [sales_trend] = await pool.query(`
            SELECT DATE(sale_date) as date, SUM(total) as revenue 
            FROM sales 
            GROUP BY DATE(sale_date) 
            ORDER BY date DESC LIMIT 7
        `);
        
        const [top_medicines] = await pool.query(`
            SELECT m.name, SUM(si.quantity) as sold_qty 
            FROM sale_items si 
            JOIN medicines m ON si.medicine_id = m.id 
            GROUP BY m.id 
            ORDER BY sold_qty DESC LIMIT 5
        `);
        
        res.json({ sales_trend, top_medicines });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getStats, getCharts };
