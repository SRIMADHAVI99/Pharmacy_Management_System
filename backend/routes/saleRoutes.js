const express = require('express');
const router = express.Router();
const { createSale, getSales, getSaleById, downloadInvoice } = require('../controllers/saleController');
const { verifyToken, isPharmacist } = require('../middleware/auth');

router.use(verifyToken);
router.use(isPharmacist);

router.get('/', getSales);
router.get('/:id', getSaleById);
router.post('/', createSale);
router.get('/:id/invoice', downloadInvoice);

module.exports = router;
