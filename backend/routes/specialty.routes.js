const express = require('express');
const router = express.Router();
const specialtyController = require('../controllers/specialty.controller');
const { verifyToken, isAdmin, isArtist } = require('../middlewares/auth');

// Rutas públicas
router.get('/', specialtyController.getAll);
router.get('/artist/:artistId', specialtyController.getArtistSpecialties);
router.get('/:id', specialtyController.getById);

// Guardar especialidades de un artista (artista logueado o admin editando)
router.post('/artist', verifyToken, isArtist, specialtyController.updateArtistSpecialties);

// Gestión administrativa de especialidades (Catálogo global)
router.post('/', verifyToken, isAdmin, specialtyController.create);
router.put('/:id', verifyToken, isAdmin, specialtyController.update);
router.delete('/:id', verifyToken, isAdmin, specialtyController.delete);

module.exports = router;
