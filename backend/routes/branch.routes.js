const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branch.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth');

// Rutas públicas
router.get('/', branchController.getAll);
router.get('/:id', branchController.getById);

// Rutas de administración
router.get('/admin/all', verifyToken, isAdmin, branchController.getAllAdmin);
router.post('/', verifyToken, isAdmin, branchController.create);
router.put('/:id', verifyToken, isAdmin, branchController.update);
router.delete('/:id', verifyToken, isAdmin, branchController.delete);

module.exports = router;
