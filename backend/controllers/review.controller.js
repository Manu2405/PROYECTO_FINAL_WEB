const Review = require('../models/review.model');
const Booking = require('../models/booking.model');
const Points = require('../models/points.model');

const reviewController = {
  async getAll(req, res) {
    try {
      const reviews = await Review.getAll();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las reseñas: ' + error.message });
    }
  },

  async getByArtist(req, res) {
    try {
      const reviews = await Review.getByArtist(req.params.artistId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las reseñas del artista: ' + error.message });
    }
  },

  async create(req, res) {
    try {
      const { id_reserva, puntuacion, comentario } = req.body;
      const id_cliente = req.user.id_usuario;

      if (!id_reserva || !puntuacion) {
        return res.status(400).json({ error: 'Reserva y puntuación (1 a 5) son requeridos' });
      }

      if (puntuacion < 1 || puntuacion > 5) {
        return res.status(400).json({ error: 'La puntuación debe ser un valor entero entre 1 y 5' });
      }

      const booking = await Booking.getById(id_reserva);
      if (!booking) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      // Validar que la reserva le pertenezca a este cliente
      if (booking.id_cliente !== id_cliente) {
        return res.status(403).json({ error: 'No tienes permiso para calificar esta reserva' });
      }

      // Verificar si ya tiene reseña para esta reserva
      const existingReview = await Review.getByBooking(id_reserva);
      if (existingReview) {
        return res.status(400).json({ error: 'Ya has calificado esta reserva anteriormente' });
      }

      const reviewId = await Review.create({
        id_cliente,
        id_artista: booking.id_artista,
        id_reserva: parseInt(id_reserva),
        puntuacion: parseInt(puntuacion),
        comentario
      });

      // Otorgar 15 puntos por escribir una reseña (incentivo de fidelización)
      const pointsAwarded = await Points.addPoints(id_cliente, 15, `Reseña de Servicio (Reserva #${id_reserva})`, reviewId);

      res.status(201).json({
        message: 'Reseña enviada con éxito. ¡Gracias por tus comentarios!',
        id: reviewId,
        fidelidad: pointsAwarded
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al crear la reseña: ' + error.message });
    }
  },

  async toggleStatus(req, res) {
    try {
      const { estado } = req.body;
      const reviewId = req.params.id;

      if (estado === undefined) {
        return res.status(400).json({ error: 'El estado es requerido' });
      }

      await Review.updateStatus(reviewId, estado);
      res.json({ message: 'Estado de la reseña actualizado con éxito' });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el estado de la reseña: ' + error.message });
    }
  }
};

module.exports = reviewController;
