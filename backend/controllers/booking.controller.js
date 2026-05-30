const Booking = require('../models/booking.model');
const { uploadToCloudinary } = require('../middlewares/upload');

const bookingController = {
  async getAll(req, res) {
    try {
      const bookings = await Booking.getAll();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las reservas: ' + error.message });
    }
  },

  async getMyBookings(req, res) {
    try {
      const clientId = req.user.id_usuario;
      const bookings = await Booking.getByClient(clientId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener tus reservas: ' + error.message });
    }
  },

  async getArtistBookings(req, res) {
    try {
      const artistId = req.user.id_usuario;
      const bookings = await Booking.getByArtist(artistId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener reservas asignadas: ' + error.message });
    }
  },

  async getById(req, res) {
    try {
      const booking = await Booking.getById(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      // Validar permisos: Solo el cliente que reservó, el artista asignado o un admin pueden verla
      if (req.user.rol !== 'admin' && 
          booking.id_cliente !== req.user.id_usuario && 
          booking.id_artista !== req.user.id_usuario) {
        return res.status(403).json({ error: 'No tienes permiso para ver esta reserva' });
      }

      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener la reserva: ' + error.message });
    }
  },

  async create(req, res) {
    try {
      const { id_artista, id_diseno, fecha_reserva, zona_cuerpo, tamano, descripcion, precio_estimado, adelanto } = req.body;
      const id_cliente = req.user.id_usuario;

      if (!id_artista || !fecha_reserva || !zona_cuerpo || !tamano) {
        return res.status(400).json({ error: 'Artista, fecha de reserva, zona del cuerpo y tamaño son obligatorios' });
      }

      // Subir imagen de referencia si está provista
      let imagen_referencia_url = null;
      if (req.file) {
        imagen_referencia_url = await uploadToCloudinary(req.file.buffer, 'referencias_reservas');
      }

      const bookingId = await Booking.create({
        id_cliente,
        id_artista: parseInt(id_artista),
        id_diseno: id_diseno ? parseInt(id_diseno) : null,
        fecha_reserva,
        zona_cuerpo,
        tamano,
        descripcion,
        imagen_referencia_url,
        precio_estimado: precio_estimado ? parseFloat(precio_estimado) : 0,
        adelanto: adelanto ? parseFloat(adelanto) : 0
      });

      res.status(201).json({ 
        message: 'Reserva solicitada con éxito. Pendiente de confirmación por el artista.', 
        id: bookingId, 
        imagen_referencia_url 
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al registrar la reserva: ' + error.message });
    }
  },

  async updateStatus(req, res) {
    try {
      const { estado, observaciones } = req.body;
      const bookingId = req.params.id;

      if (!estado) {
        return res.status(400).json({ error: 'El estado es obligatorio' });
      }

      const booking = await Booking.getById(bookingId);
      if (!booking) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      // Validar permisos: Artistas y admins pueden actualizar el estado. Los clientes solo pueden cancelar su propia reserva.
      if (req.user.rol === 'cliente') {
        if (booking.id_cliente !== req.user.id_usuario) {
          return res.status(403).json({ error: 'No tienes permiso para modificar esta reserva' });
        }
        if (estado !== 'cancelada') {
          return res.status(400).json({ error: 'Como cliente, solo puedes cambiar el estado a "cancelada"' });
        }
      } else if (req.user.rol === 'artista') {
        if (booking.id_artista !== req.user.id_usuario) {
          return res.status(403).json({ error: 'No eres el artista asignado a esta reserva' });
        }
      }

      await Booking.updateStatus(bookingId, estado, observaciones);
      res.json({ message: `Reserva cambiada a estado: ${estado} con éxito` });
    } catch (error) {
      res.status(500).json({ error: 'Error al cambiar estado de la reserva: ' + error.message });
    }
  },

  async updateEstimation(req, res) {
    try {
      const { precio_estimado, adelanto } = req.body;
      const bookingId = req.params.id;

      if (precio_estimado === undefined || adelanto === undefined) {
        return res.status(400).json({ error: 'Precio estimado y adelanto son obligatorios' });
      }

      const booking = await Booking.getById(bookingId);
      if (!booking) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      // Verificar que el artista asignado o el administrador sea quien actualice
      if (req.user.rol !== 'admin' && booking.id_artista !== req.user.id_usuario) {
        return res.status(403).json({ error: 'No tienes permisos para definir precios sobre esta reserva' });
      }

      await Booking.updateEstimation(bookingId, parseFloat(precio_estimado), parseFloat(adelanto));
      res.json({ message: 'Cotización e importe de adelanto actualizados con éxito' });
    } catch (error) {
      res.status(500).json({ error: 'Error al cotizar la reserva: ' + error.message });
    }
  }
};

module.exports = bookingController;
