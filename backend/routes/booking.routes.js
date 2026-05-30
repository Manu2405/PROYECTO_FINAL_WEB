const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { verifyToken, isAdmin, isArtist } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

// Rutas de reservas del cliente
router.get('/my-bookings', verifyToken, bookingController.getMyBookings);

// Rutas de reservas del artista
router.get('/artist-bookings', verifyToken, isArtist, bookingController.getArtistBookings);

// Ver reserva detallada
router.get('/:id', verifyToken, bookingController.getById);

// Solicitar nueva reserva
router.post('/', verifyToken, upload.single('imagen_referencia'), bookingController.create);

// Cambiar estado de la reserva (confirmar, cancelar, finalizar)
router.put('/:id/status', verifyToken, bookingController.updateStatus);

// Cotizar e indicar pago de adelanto de la reserva
router.put('/:id/estimation', verifyToken, isArtist, bookingController.updateEstimation);

// Listar todas las reservas (admin)
router.get('/', verifyToken, isAdmin, bookingController.getAll);

module.exports = router;
