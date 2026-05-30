const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

// Rutas de autenticación y públicas
router.post('/register', upload.single('foto'), userController.register);
router.post('/login', userController.login);
router.get('/artists', userController.getArtists);

// Rutas de usuario logueado
router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, upload.single('foto'), userController.updateProfile);

// Rutas administrativas
router.get('/', verifyToken, isAdmin, userController.getAllUsers);
router.put('/:id/role', verifyToken, isAdmin, userController.updateRole);
router.put('/:id/status', verifyToken, isAdmin, userController.toggleStatus);

module.exports = router;
