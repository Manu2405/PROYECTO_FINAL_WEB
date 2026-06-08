const Booking = require('../models/booking.model');
const User = require('../models/user.model');
const Points = require('../models/points.model');
const { uploadToCloudinary } = require('../middlewares/upload');
const { getAvailableSlots, getMonthAvailability } = require('../utils/availability');

const bookingController = {
  async getAvailability(req, res) {
    try {
      const { artistId } = req.params;
      const { fecha, duracion } = req.query;

      const artist = await User.findById(artistId);
      if (!artist || artist.rol !== 'artista') {
        return res.status(404).json({ error: 'Artista no encontrado' });
      }

      const durationHours = Math.min(parseFloat(duracion) || 1, 3);

      if (fecha) {
        const bookings = await Booking.getArtistBookingsOnDate(artistId, fecha);
        const result = getAvailableSlots(
          artist.horario_inicio || '10:00:00',
          artist.horario_fin || '18:00:00',
          bookings,
          durationHours
        );
        return res.json({
          fecha,
          horario_inicio: artist.horario_inicio,
          horario_fin: artist.horario_fin,
          ...result,
        });
      }

      const now = new Date();
      const year = parseInt(req.query.year, 10) || now.getFullYear();
      const month = parseInt(req.query.month, 10) || now.getMonth() + 1;

      const [allBookings] = await require('../config/db').query(
        `SELECT DATE(fecha_reserva) as dia, fecha_reserva, hora_fin, duracion_horas
         FROM reservas WHERE id_artista = ? AND estado NOT IN ('cancelada')
         AND MONTH(fecha_reserva) = ? AND YEAR(fecha_reserva) = ?`,
        [artistId, month, year]
      );

      const byDate = {};
      allBookings.forEach((b) => {
        const d = b.dia.toISOString().split('T')[0];
        if (!byDate[d]) byDate[d] = [];
        byDate[d].push(b);
      });

      const dias = getMonthAvailability(artist, byDate, year, month, durationHours);
      res.json({ year, month, dias, horario_inicio: artist.horario_inicio, horario_fin: artist.horario_fin });
    } catch (error) {
      res.status(500).json({ error: 'Error al consultar disponibilidad: ' + error.message });
    }
  },

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
      const bookings = await Booking.getByClient(req.user.id_usuario);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener tus reservas: ' + error.message });
    }
  },

  async getArtistBookings(req, res) {
    try {
      const bookings = await Booking.getByArtist(req.user.id_usuario);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener reservas asignadas: ' + error.message });
    }
  },

  async getById(req, res) {
    try {
      const booking = await Booking.getById(req.params.id);
      if (!booking) return res.status(404).json({ error: 'Reserva no encontrada' });

      if (req.user.rol !== 'admin'
          && booking.id_cliente !== req.user.id_usuario
          && booking.id_artista !== req.user.id_usuario) {
        return res.status(403).json({ error: 'No tienes permiso para ver esta reserva' });
      }

      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener la reserva: ' + error.message });
    }
  },

  async create(req, res) {
    try {
      const {
        id_artista, fecha_reserva, hora_inicio, hora_fin, zona_cuerpo, tamano,
        descripcion, duracion_horas, numero_sesiones, modo_sesiones,
      } = req.body;
      const id_cliente = req.user.id_usuario;

      if (!id_artista || !fecha_reserva || !hora_inicio || !zona_cuerpo || !tamano) {
        return res.status(400).json({ error: 'Artista, fecha, hora, zona y tamaño son obligatorios' });
      }

      const artist = await User.findById(id_artista);
      if (!artist || artist.rol !== 'artista') {
        return res.status(400).json({ error: 'Artista no válido' });
      }

      const duracion = Math.min(parseFloat(duracion_horas) || 1, 3);
      const sesiones = parseInt(numero_sesiones, 10) || 1;
      const modo = modo_sesiones || 'unica';

      const [y, mo, da] = fecha_reserva.split('-').map(Number);
      const [hh, mm] = hora_inicio.slice(0, 5).split(':').map(Number);
      const startDate = new Date(y, mo - 1, da, hh, mm || 0);
      if (startDate < new Date()) {
        return res.status(400).json({ error: 'No puedes reservar en una fecha u hora pasada' });
      }

      const maxBooking = new Date();
      maxBooking.setFullYear(maxBooking.getFullYear() + 1);
      maxBooking.setHours(23, 59, 59, 999);
      if (startDate > maxBooking) {
        return res.status(400).json({ error: 'La reserva no puede ser posterior a un año desde hoy' });
      }

      let endDate;
      if (hora_fin) {
        const [eh, em] = hora_fin.slice(0, 5).split(':').map(Number);
        endDate = new Date(y, mo - 1, da, eh, em || 0);
      } else {
        endDate = new Date(startDate.getTime() + duracion * 3600000);
      }

      const fechaInicio = `${fecha_reserva}T${hora_inicio.slice(0, 5)}:00`;
      const fechaFinStr = `${fecha_reserva}T${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:00`;

      const dayBookings = await Booking.getArtistBookingsOnDate(id_artista, fecha_reserva);
      const { getAvailableSlots: slotsFn, parseTimeToMinutes } = require('../utils/availability');
      const { slots } = slotsFn(
        artist.horario_inicio || '10:00:00',
        artist.horario_fin || '18:00:00',
        dayBookings,
        duracion
      );

      if (!slots.includes(hora_inicio.slice(0, 5))) {
        return res.status(400).json({ error: 'El horario seleccionado ya no está disponible' });
      }

      let imagen_referencia_url = null;
      if (req.file) {
        imagen_referencia_url = await uploadToCloudinary(req.file.buffer, 'referencias_reservas');
      }

      const level = await Points.getClientLevel(id_cliente);
      let descuento_porcentaje = 0;
      let puntos_canjeados = 0;

      if (level && level.descuento_pendiente > 0) {
        descuento_porcentaje = level.descuento_pendiente;
        puntos_canjeados = (descuento_porcentaje / 10) * 100;
        await Points.clearPendingDiscount(id_cliente);
      }

      const bookingId = await Booking.create({
        id_cliente,
        id_artista: parseInt(id_artista, 10),
        id_diseno: null,
        fecha_reserva: fechaInicio.replace(' ', 'T'),
        hora_fin: fechaFinStr,
        zona_cuerpo,
        tamano,
        descripcion,
        imagen_referencia_url,
        precio_estimado: 0,
        adelanto: 0,
        descuento_porcentaje,
        puntos_canjeados,
        duracion_horas: duracion,
        numero_sesiones: sesiones,
        modo_sesiones: modo,
      });

      const client = await User.findById(id_cliente);
      const tamanoLabels = { pequeno: 'Pequeño', mediano: 'Mediano', grande: 'Grande', extra_grande: 'Extra grande' };

      const whatsappMsg = [
        
        `*Cliente:* ${client.nombre} ${client.apellido}`,
        `*Artista:* ${artist.nombre} ${artist.apellido}`,
        `*Fecha:* ${fecha_reserva}`,
        `*Hora:* ${hora_inicio.slice(0, 5)} - ${fechaFinStr.split('T')[1]?.slice(0, 5)}`,
        `*Zona:* ${zona_cuerpo}`,
        `*Tamaño:* ${tamanoLabels[tamano] || tamano}`,
        `*Duración:* ${duracion}h`,
        modo === 'multiple' ? `*Sesiones:* ${sesiones} sesiones de hasta 3h` : null,
        modo === 'discutir' ? `*Sesiones:* Prefiero discutirlo con el artista` : null,
        descripcion ? `*Descripción:* ${descripcion}` : null,
        imagen_referencia_url ? `*Referencia:* ${imagen_referencia_url}` : null,
        ``,
      ].filter(Boolean).join('\n');

      res.status(201).json({
        message: 'Reserva solicitada. Se abrirá WhatsApp para coordinar con el artista.',
        id: bookingId,
        imagen_referencia_url,
        whatsapp: artist.whatsapp || '65242305',
        whatsapp_message: whatsappMsg,
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al registrar la reserva: ' + error.message });
    }
  },

  async updateStatus(req, res) {
    try {
      const { estado, observaciones } = req.body;
      const bookingId = req.params.id;

      if (!estado) return res.status(400).json({ error: 'El estado es obligatorio' });

      const booking = await Booking.getById(bookingId);
      if (!booking) return res.status(404).json({ error: 'Reserva no encontrada' });

      if (req.user.rol === 'cliente') {
        if (booking.id_cliente !== req.user.id_usuario) {
          return res.status(403).json({ error: 'No tienes permiso para modificar esta reserva' });
        }
        if (estado !== 'cancelada') {
          return res.status(400).json({ error: 'Como cliente, solo puedes cancelar la reserva' });
        }
      } else if (req.user.rol === 'artista') {
        if (booking.id_artista !== req.user.id_usuario) {
          return res.status(403).json({ error: 'No eres el artista asignado a esta reserva' });
        }
      }

      if (estado === 'cancelada' && booking.puntos_canjeados > 0 && ['pendiente', 'confirmada'].includes(booking.estado)) {
        await Points.addPoints(
          booking.id_cliente,
          booking.puntos_canjeados,
          `Devolución por cancelación reserva #${bookingId}`,
          bookingId
        );
      }

      await Booking.updateStatus(bookingId, estado, observaciones);
      const label = estado === 'confirmada' ? 'aprobada' : estado;
      res.json({ message: `Reserva ${label} con éxito` });
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
      if (!booking) return res.status(404).json({ error: 'Reserva no encontrada' });

      if (req.user.rol !== 'admin' && booking.id_artista !== req.user.id_usuario) {
        return res.status(403).json({ error: 'No tienes permisos para cotizar esta reserva' });
      }

      await Booking.updateEstimation(bookingId, parseFloat(precio_estimado), parseFloat(adelanto));
      res.json({ message: 'Cotización actualizada con éxito' });
    } catch (error) {
      res.status(500).json({ error: 'Error al cotizar la reserva: ' + error.message });
    }
  },
};

module.exports = bookingController;
