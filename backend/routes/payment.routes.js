const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

// Obtener los pagos registrados para una reserva específica
router.get('/booking/:bookingId', verifyToken, paymentController.getByBooking);

// Registrar un pago (subiendo el comprobante opcionalmente)
router.post('/', verifyToken, upload.single('comprobante'), paymentController.create);

// Actualizar estado de aprobación del pago (admin)
router.put('/:id/status', verifyToken, isAdmin, paymentController.updateStatus);

// Listar todos los pagos globales (admin)
router.get('/', verifyToken, isAdmin, paymentController.getAll);

module.exports = router;
