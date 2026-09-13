const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken);
router.use(isAdmin); // Only Admin can manage users

router.get('/', userController.getAll);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

module.exports = router;
