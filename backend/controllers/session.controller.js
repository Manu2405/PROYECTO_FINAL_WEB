const Session = require('../models/session.model');
const Booking = require('../models/booking.model');

const sessionController = {
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
        return res.status(403).json({ error: 'No tienes permiso para ver las sesiones de esta reserva' });
      }

      const sessions = await Session.getByBooking(bookingId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las sesiones: ' + error.message });
    }
  },

  async create(req, res) {
    try {
      const { id_reserva, numero_sesion, fecha_inicio, fecha_fin, duracion_horas, observaciones } = req.body;

      if (!id_reserva || !numero_sesion || !fecha_inicio || !fecha_fin) {
        return res.status(400).json({ error: 'Reserva, número de sesión, fecha de inicio y fecha de fin son requeridos' });
      }

      const booking = await Booking.getById(id_reserva);
      if (!booking) {
        return res.status(404).json({ error: 'Reserva asociada no encontrada' });
      }

      // Validar permisos (solo el artista de la reserva o admin)
      if (req.user.rol !== 'admin' && booking.id_artista !== req.user.id_usuario) {
        return res.status(403).json({ error: 'No autorizado para crear sesiones para esta reserva' });
      }

      const id = await Session.create({
        id_reserva: parseInt(id_reserva),
        numero_sesion: parseInt(numero_sesion),
        fecha_inicio,
        fecha_fin,
        duracion_horas: duracion_horas ? parseFloat(duracion_horas) : null,
        observaciones
      });

      res.status(201).json({ message: 'Sesión programada con éxito', id });
    } catch (error) {
      res.status(500).json({ error: 'Error al programar la sesión: ' + error.message });
    }
  },

  async update(req, res) {
    try {
      const sessionId = req.params.id;
      const { numero_sesion, fecha_inicio, fecha_fin, duracion_horas, observaciones, estado } = req.body;

      if (!numero_sesion || !fecha_inicio || !fecha_fin) {
        return res.status(400).json({ error: 'Número de sesión, fecha de inicio y fecha de fin son requeridos' });
      }

      const session = await Session.getById(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Sesión no encontrada' });
      }

      const booking = await Booking.getById(session.id_reserva);
      // Validar permisos
      if (req.user.rol !== 'admin' && booking.id_artista !== req.user.id_usuario) {
        return res.status(403).json({ error: 'No autorizado para modificar esta sesión' });
      }

      await Session.update(sessionId, {
        numero_sesion: parseInt(numero_sesion),
        fecha_inicio,
        fecha_fin,
        duracion_horas: duracion_horas ? parseFloat(duracion_horas) : null,
        observaciones,
        estado
      });

      res.json({ message: 'Sesión actualizada con éxito' });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la sesión: ' + error.message });
    }
  },

  async delete(req, res) {
    try {
      const sessionId = req.params.id;
      const session = await Session.getById(sessionId);

      if (!session) {
        return res.status(404).json({ error: 'Sesión no encontrada' });
      }

      const booking = await Booking.getById(session.id_reserva);
      if (req.user.rol !== 'admin' && booking.id_artista !== req.user.id_usuario) {
        return res.status(403).json({ error: 'No autorizado para eliminar esta sesión' });
      }

      await Session.delete(sessionId);
      res.json({ message: 'Sesión eliminada con éxito' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar la sesión: ' + error.message });
    }
  }
};

module.exports = sessionController;
