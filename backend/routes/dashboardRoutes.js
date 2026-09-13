const express = require('express');
const router = express.Router();
const { getStats, getCharts } = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/stats', getStats);
router.get('/charts', getCharts);

module.exports = router;
