const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const { verifyToken, isArtist } = require('../middlewares/auth');

// Obtener las sesiones de una reserva
router.get('/booking/:bookingId', verifyToken, sessionController.getByBooking);

// Agendar y gestionar sesiones (artistas y admins)
router.post('/', verifyToken, isArtist, sessionController.create);
router.put('/:id', verifyToken, isArtist, sessionController.update);
router.delete('/:id', verifyToken, isArtist, sessionController.delete);

module.exports = router;
