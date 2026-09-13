const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, isPharmacist } = require('../middleware/auth');

router.use(verifyToken);
router.use(isPharmacist);

router.get('/sales', reportController.getSalesReport);
router.get('/inventory', reportController.getInventoryReport);
router.get('/purchases', reportController.getPurchaseReport);

module.exports = router;
