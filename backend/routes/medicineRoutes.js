const express = require('express');
const router = express.Router();
const { getMedicines, getMedicineById, createMedicine, updateMedicine, deleteMedicine } = require('../controllers/medicineController');
const { verifyToken, isPharmacist } = require('../middleware/auth');

router.use(verifyToken);
router.use(isPharmacist);

router.get('/', getMedicines);
router.get('/:id', getMedicineById);
router.post('/', createMedicine);
router.put('/:id', updateMedicine);
router.delete('/:id', deleteMedicine);

module.exports = router;
