const express = require('express');
const router = express.Router();
const designController = require('../controllers/design.controller');
const { verifyToken, isArtist } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const jwt = require('jsonwebtoken');

// Middleware opcional para detectar si el usuario está autenticado al listar el portafolio
const decodeTokenOptional = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkeychangeit123!');
      req.user = decoded;
    } catch (error) {
      // Ignorar token fallido para permitir búsqueda pública
    }
  }
  next();
};

// Rutas públicas
router.get('/', decodeTokenOptional, designController.getAll);
router.get('/:id', designController.getById);
router.post('/:id/like', verifyToken, designController.toggleLike);

// Rutas del artista (cargar/editar su portafolio)
router.post('/', verifyToken, isArtist, upload.single('imagen'), designController.create);
router.put('/:id', verifyToken, isArtist, upload.single('imagen'), designController.update);
router.delete('/:id', verifyToken, isArtist, designController.delete);

module.exports = router;
