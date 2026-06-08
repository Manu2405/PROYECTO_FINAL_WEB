const Comment = require('../models/comment.model');
const db = require('../config/db');

const commentController = {
  async getByPublication(req, res) {
    try {
      const comments = await Comment.getByPublication(req.params.id);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener comentarios: ' + error.message });
    }
  },

  async create(req, res) {
    try {
      const { contenido } = req.body;
      const id_publicacion = req.params.id;
      const id_usuario = req.user.id_usuario;

      if (!contenido || contenido.trim() === '') {
        return res.status(400).json({ error: 'El contenido del comentario es requerido' });
      }

      const commentId = await Comment.create({
        id_publicacion,
        id_usuario,
        contenido
      });

      res.status(201).json({
        message: 'Comentario creado exitosamente',
        id: commentId
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al crear comentario: ' + error.message });
    }
  },

  async delete(req, res) {
    try {
      const commentId = req.params.commentId;
      
      // Verificar que el usuario es el dueño del comentario o admin
      const [rows] = await db.query(
        'SELECT * FROM comentarios_publicaciones WHERE id_comentario = ?',
        [commentId]
      );
      const comment = rows[0];
      if (!comment) {
        return res.status(404).json({ error: 'Comentario no encontrado' });
      }

      if (req.user.rol !== 'admin' && comment.id_usuario !== req.user.id_usuario) {
        return res.status(403).json({ error: 'No autorizado para eliminar este comentario' });
      }

      await Comment.delete(commentId);
      res.json({ message: 'Comentario eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar comentario: ' + error.message });
    }
  }
};

module.exports = commentController;
