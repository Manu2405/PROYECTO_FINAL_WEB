const express = require('express');
const router = express.Router();
const pointsController = require('../controllers/points.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth');

// Obtener estatus de fidelidad del usuario autenticado
router.get('/my-level', verifyToken, pointsController.getMyLevel);
router.get('/my-history', verifyToken, pointsController.getMyHistory);
router.post('/canjear', verifyToken, pointsController.redeemDiscount);

// Gestión y visualización administrativa
router.get('/search', verifyToken, isAdmin, pointsController.searchClientsAdmin);
router.get('/client/:clientId', verifyToken, isAdmin, pointsController.getClientLevelAdmin);

module.exports = router;
