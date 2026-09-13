const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { verifyToken, isPharmacist, isAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/prescriptions/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});
const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

router.use(verifyToken);

router.get('/', prescriptionController.getAll);
router.post('/', upload.single('image'), prescriptionController.create);
router.put('/:id/verify', isPharmacist, prescriptionController.verify);
router.get('/:id', prescriptionController.getById);

module.exports = router;
