const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

router.post('/register', upload.single('foto'), userController.register);
router.post('/login', userController.login);
router.get('/confirmar/:token', userController.confirmAccount);
router.get('/artists', userController.getArtists);

router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, upload.single('foto'), userController.updateProfile);

router.get('/', verifyToken, isAdmin, userController.getAllUsers);
router.post('/', verifyToken, isAdmin, userController.createUserAdmin);
router.get('/:id', verifyToken, isAdmin, userController.getUserById);
router.put('/:id', verifyToken, isAdmin, userController.updateUserAdmin);
router.put('/:id/status', verifyToken, isAdmin, userController.toggleStatus);

module.exports = router;
