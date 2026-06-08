const Publication = require('../models/publication.model');
const Vote = require('../models/vote.model');
const Booking = require('../models/booking.model');
const Points = require('../models/points.model');
const { uploadToCloudinary } = require('../middlewares/upload');

const publicationController = {
  async getAll(req, res) {
    try {
      // Si el usuario está autenticado, cargamos qué voto hizo él en cada publicación
      const userId = req.user ? req.user.id_usuario : null;
      const publications = await Publication.getAll(userId);
      res.json(publications);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el mural de publicaciones: ' + error.message });
    }
  },

  async getById(req, res) {
    try {
      const publication = await Publication.getById(req.params.id);
      if (!publication) {
        return res.status(404).json({ error: 'Publicación no encontrada' });
      }
      res.json(publication);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener la publicación: ' + error.message });
    }
  },

  async create(req, res) {
    try {
      const { id_artista, id_reserva, descripcion, fecha_tatuaje, zona_cuerpo } = req.body;
      const id_cliente = req.user.id_usuario;

      if (!id_artista || !fecha_tatuaje) {
        return res.status(400).json({ error: 'Artista y fecha del tatuaje son requeridos' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Debe subir la fotografía del tatuaje realizado' });
      }

      // Validar reserva si se provee
      if (id_reserva) {
        const booking = await Booking.getById(id_reserva);
        if (!booking || booking.id_cliente !== id_cliente) {
          return res.status(400).json({ error: 'Reserva provista no es válida para este usuario' });
        }
      }

      // Subir imagen a Cloudinary
      const imagen_url = await uploadToCloudinary(req.file.buffer, 'publicaciones_tatuajes');

      const pubId = await Publication.create({
        id_cliente,
        id_artista: parseInt(id_artista),
        id_reserva: id_reserva ? parseInt(id_reserva) : null,
        imagen_url,
        descripcion,
        fecha_tatuaje,
        zona_cuerpo
      });

      // Otorgar 30 puntos por compartir su tatuaje con la comunidad
      const pointsAwarded = await Points.addPoints(id_cliente, 30, `Compartir Tatuaje en Mural (Publicación #${pubId})`, pubId);

      res.status(201).json({
        message: '¡Tatuaje publicado en el mural de la comunidad!',
        id: pubId,
        imagen_url,
        fidelidad: pointsAwarded
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al publicar el tatuaje: ' + error.message });
    }
  },

  async vote(req, res) {
    try {
      const { tipo_voto } = req.body; // 'positivo' o 'negativo'
      const publicationId = req.params.id;
      const userId = req.user.id_usuario;

      if (!tipo_voto || !['positivo', 'negativo'].includes(tipo_voto)) {
        return res.status(400).json({ error: 'tipo_voto debe ser "positivo" o "negativo"' });
      }

      const pub = await Publication.getById(publicationId);
      if (!pub) {
        return res.status(404).json({ error: 'Publicación no encontrada' });
      }

      // Registrar o alternar voto
      const actionResult = await Vote.vote(publicationId, userId, tipo_voto);

      // Recalcular y actualizar totales en la tabla de publicaciones
      const updatedTotals = await Publication.updateVoteCounts(publicationId);
      const currentVote = await Vote.getVote(publicationId, userId);

      res.json({
        message: `Voto registrado (${actionResult})`,
        ...updatedTotals,
        mi_voto: currentVote?.tipo_voto || null,
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al votar en la publicación: ' + error.message });
    }
  },

  async delete(req, res) {
    try {
      const pubId = req.params.id;
      const pub = await Publication.getById(pubId);

      if (!pub) {
        return res.status(404).json({ error: 'Publicación no encontrada' });
      }

      // Solo el cliente dueño del post, o el artista del tatuaje, o el admin pueden eliminar
      if (req.user.rol !== 'admin' && 
          pub.id_cliente !== req.user.id_usuario && 
          pub.id_artista !== req.user.id_usuario) {
        return res.status(403).json({ error: 'No autorizado para eliminar esta publicación' });
      }

      await Publication.delete(pubId);
      res.json({ message: 'Publicación eliminada con éxito' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar la publicación: ' + error.message });
    }
  }
};

module.exports = publicationController;
