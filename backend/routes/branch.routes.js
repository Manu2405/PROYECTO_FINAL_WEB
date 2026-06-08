const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branch.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

router.get('/', branchController.getAll);
router.get('/admin/all', verifyToken, isAdmin, branchController.getAllAdmin);
router.get('/:id', branchController.getById);

router.post(
  '/',
  verifyToken,
  isAdmin,
  upload.array('imagenes', 5),
  branchController.create
);

router.put(
  '/:id',
  verifyToken,
  isAdmin,
  upload.array('imagenes', 5),
  branchController.update
);

router.delete(
  '/:id',
  verifyToken,
  isAdmin,
  branchController.delete
);

module.exports = router;