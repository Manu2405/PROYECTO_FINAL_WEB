const express = require('express');
const router = express.Router();
const publicationController = require('../controllers/publication.controller');
const commentController = require('../controllers/comment.controller');
const { verifyToken } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const jwt = require('jsonwebtoken');

// Middleware opcional para decodificar JWT en el mural comunitario
const decodeTokenOptional = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkeychangeit123!');
      req.user = decoded;
    } catch (error) {
      // Ignorar
    }
  }
  next();
};

// Rutas de publicaciones del mural
router.get('/', decodeTokenOptional, publicationController.getAll);
router.get('/:id', publicationController.getById);

// Crear publicación con foto real
router.post('/', verifyToken, upload.single('imagen'), publicationController.create);

// Registrar votos positivos/negativos (Me gusta / No me gusta)
router.post('/:id/vote', verifyToken, publicationController.vote);

// Eliminar post
router.delete('/:id', verifyToken, publicationController.delete);

// Comentarios
router.get('/:id/comments', decodeTokenOptional, commentController.getByPublication);
router.post('/:id/comments', verifyToken, commentController.create);
router.delete('/:id/comments/:commentId', verifyToken, commentController.delete);

module.exports = router;
