const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware para verificar el Token JWT enviado en las cabeceras HTTP.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato esperado: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no provisto.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkeychangeit123!');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

/**
 * Middleware para validar que el usuario autenticado tiene uno de los roles permitidos.
 * @param {string[]} roles Roles permitidos
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso no autorizado para este rol.' });
    }

    next();
  };
};

const isAdmin = checkRole(['admin']);
const isArtist = checkRole(['admin', 'artista']);
const isClient = checkRole(['admin', 'cliente']);

module.exports = { verifyToken, checkRole, isAdmin, isArtist, isClient };
