const Payment = require('../models/payment.model');
const Booking = require('../models/booking.model');
const Points = require('../models/points.model');
const { uploadToCloudinary } = require('../middlewares/upload');

const paymentController = {
  async getAll(req, res) {
    try {
      const payments = await Payment.getAll();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los pagos: ' + error.message });
    }
  },

  async getByBooking(req, res) {
    try {
      const bookingId = req.params.bookingId;
      const booking = await Booking.getById(bookingId);

      if (!booking) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      // Validar permisos
      if (req.user.rol !== 'admin' && 
          booking.id_cliente !== req.user.id_usuario && 
          booking.id_artista !== req.user.id_usuario) {
        return res.status(403).json({ error: 'No tienes permiso para ver los pagos de esta reserva' });
      }

      const payments = await Payment.getByBooking(bookingId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los pagos de la reserva: ' + error.message });
    }
  },

  async create(req, res) {
    try {
      const { id_reserva, monto, metodo_pago, referencia_transaccion, estado } = req.body;

      if (!id_reserva || !monto || !metodo_pago) {
        return res.status(400).json({ error: 'Reserva, monto y método de pago son requeridos' });
      }

      const booking = await Booking.getById(id_reserva);
      if (!booking) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      // Validar permisos: Clientes solo registran sus propios pagos. Admins/Artistas registran cualquiera.
      if (req.user.rol === 'cliente' && booking.id_cliente !== req.user.id_usuario) {
        return res.status(403).json({ error: 'No autorizado para registrar pagos en esta reserva' });
      }

      // Si se sube una imagen de comprobante
      let comprobante_url = null;
      if (req.file) {
        comprobante_url = await uploadToCloudinary(req.file.buffer, 'comprobantes_pagos');
      }

      // Por defecto, si lo crea el cliente mediante QR/Transferencia queda 'pendiente' de verificación.
      // Si es tarjeta/efectivo o lo registra el artista/admin queda 'pagado'
      const statusFinal = estado || (req.user.rol === 'cliente' && (metodo_pago === 'qr' || metodo_pago === 'transferencia') ? 'pendiente' : 'pagado');

      const paymentId = await Payment.create({
        id_reserva: parseInt(id_reserva),
        monto: parseFloat(monto),
        metodo_pago,
        comprobante_url,
        referencia_transaccion,
        estado: statusFinal
      });

      // Si el pago es registrado como 'pagado' inmediatamente, otorgar puntos de fidelización
      let pointsAwarded = null;
      if (statusFinal === 'pagado') {
        // Otorgar 1 punto por cada $10 gastados (ajustable)
        const pts = Math.max(1, Math.floor(parseFloat(monto) / 10));
        pointsAwarded = await Points.addPoints(booking.id_cliente, pts, `Pago de Reserva #${id_reserva}`, paymentId);
      }

      res.status(201).json({
        message: 'Pago registrado con éxito',
        id: paymentId,
        estado: statusFinal,
        comprobante_url,
        fidelidad: pointsAwarded
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al registrar el pago: ' + error.message });
    }
  },

  async updateStatus(req, res) {
    try {
      const { estado } = req.body;
      const paymentId = req.params.id;

      if (!estado) {
        return res.status(400).json({ error: 'El estado es requerido' });
      }

      const payment = await Payment.getById(paymentId);
      if (!payment) {
        return res.status(404).json({ error: 'Pago no encontrado' });
      }

      const booking = await Booking.getById(payment.id_reserva);

      // Si cambia de pendiente a pagado, otorgar puntos de fidelización
      let pointsAwarded = null;
      if (payment.estado !== 'pagado' && estado === 'pagado') {
        const pts = Math.max(1, Math.floor(parseFloat(payment.monto) / 10));
        pointsAwarded = await Points.addPoints(booking.id_cliente, pts, `Aprobación de Pago #${paymentId} (Reserva #${booking.id_reserva})`, paymentId);
      }

      await Payment.updateStatus(paymentId, estado);
      res.json({
        message: `Estado del pago actualizado a ${estado} con éxito`,
        fidelidad: pointsAwarded
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el estado del pago: ' + error.message });
    }
  }
};

module.exports = paymentController;
