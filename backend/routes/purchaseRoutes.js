const express = require('express');
const router = express.Router();
const { createPurchase, getPurchases } = require('../controllers/purchaseController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken);
// Assuming purchases are mostly Admin tasks, but maybe Pharmacist too. Let's stick to auth.
// api_contracts doesn't explicitly restrict, but let's just use verifyToken for now.

router.get('/', getPurchases);
router.post('/', createPurchase);

module.exports = router;
