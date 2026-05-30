const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth');

// Obtener las reseñas públicas de un artista
router.get('/artist/:artistId', reviewController.getByArtist);

// Crear una nueva reseña (clientes)
router.post('/', verifyToken, reviewController.create);

// Gestión de reseñas (admin)
router.get('/', verifyToken, isAdmin, reviewController.getAll);
router.put('/:id/status', verifyToken, isAdmin, reviewController.toggleStatus);

module.exports = router;
