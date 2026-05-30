const User = require('../models/user.model');
const Points = require('../models/points.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { uploadToCloudinary } = require('../middlewares/upload');
require('dotenv').config();

const userController = {
  async register(req, res) {
    try {
      const { nombre, apellido, email, password, telefono, biografia, fecha_nacimiento, rol, id_sucursal } = req.body;

      if (!nombre || !apellido || !email || !password) {
        return res.status(400).json({ error: 'Nombre, apellido, email y contraseña son obligatorios' });
      }

      // Validar si el email ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
      }

      // Encriptar contraseña
      const password_hash = await bcrypt.hash(password, 10);

      // Manejar foto de perfil inicial si se sube
      let foto_url = null;
      if (req.file) {
        foto_url = await uploadToCloudinary(req.file.buffer, 'usuarios');
      }

      // Crear usuario
      const userId = await User.create({
        nombre,
        apellido,
        email,
        password_hash,
        telefono,
        foto_url,
        biografia,
        fecha_nacimiento,
        rol: rol || 'cliente',
        id_sucursal: rol === 'artista' ? id_sucursal : null
      });

      // Inicializar el nivel de fidelización para clientes
      if (!rol || rol === 'cliente') {
        await Points.initializeClient(userId);
      }

      res.status(201).json({ message: 'Usuario registrado con éxito', id: userId });
    } catch (error) {
      res.status(500).json({ error: 'Error al registrar el usuario: ' + error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Credenciales incorrectas (usuario no encontrado)' });
      }

      if (!user.estado) {
        return res.status(403).json({ error: 'Esta cuenta ha sido desactivada. Póngase en contacto con el administrador.' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Credenciales incorrectas (contraseña incorrecta)' });
      }

      // Actualizar último login
      await User.updateLastLogin(user.id_usuario);

      // Generar token JWT
      const token = jwt.sign(
        {
          id_usuario: user.id_usuario,
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          rol: user.rol,
          id_sucursal: user.id_sucursal
        },
        process.env.JWT_SECRET || 'supersecretjwtkeychangeit123!',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login exitoso',
        token,
        user: {
          id_usuario: user.id_usuario,
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          rol: user.rol,
          foto_url: user.foto_url
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al iniciar sesión: ' + error.message });
    }
  },

  async getProfile(req, res) {
    try {
      // El id proviene de la decodificación del token en verifyToken
      const user = await User.findById(req.user.id_usuario);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      // Remover hash antes de enviar
      delete user.password_hash;
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el perfil: ' + error.message });
    }
  },

  async updateProfile(req, res) {
    try {
      const userId = req.user.id_usuario;
      const { nombre, apellido, telefono, biografia, fecha_nacimiento, id_sucursal } = req.body;

      if (!nombre || !apellido) {
        return res.status(400).json({ error: 'Nombre y apellido son obligatorios' });
      }

      // Subir nueva foto a Cloudinary si existe
      let foto_url = null;
      if (req.file) {
        foto_url = await uploadToCloudinary(req.file.buffer, 'usuarios');
      }

      await User.updateProfile(userId, {
        nombre,
        apellido,
        telefono,
        foto_url,
        biografia,
        fecha_nacimiento,
        id_sucursal: req.user.rol === 'artista' ? id_sucursal : null
      });

      res.json({ message: 'Perfil actualizado con éxito', foto_url });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el perfil: ' + error.message });
    }
  },

  async getArtists(req, res) {
    try {
      const artists = await User.getArtists();
      res.json(artists);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los artistas: ' + error.message });
    }
  },

  async getAllUsers(req, res) {
    try {
      const users = await User.getAll();
      // Limpiar hash
      users.forEach(u => delete u.password_hash);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los usuarios: ' + error.message });
    }
  },

  async updateRole(req, res) {
    try {
      const { rol, id_sucursal } = req.body;
      const { id } = req.params;

      if (!rol) {
        return res.status(400).json({ error: 'El rol es obligatorio' });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      await User.updateRole(id, rol, rol === 'artista' ? id_sucursal : null);
      
      // Si cambia a cliente, asegurar que tenga el registro de fidelización
      if (rol === 'cliente') {
        await Points.initializeClient(id);
      }

      res.json({ message: 'Rol de usuario actualizado con éxito' });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el rol: ' + error.message });
    }
  },

  async toggleStatus(req, res) {
    try {
      const { estado } = req.body;
      const { id } = req.params;

      if (estado === undefined) {
        return res.status(400).json({ error: 'El estado es obligatorio' });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      await User.updateStatus(id, estado);
      res.json({ message: 'Estado del usuario actualizado con éxito' });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el estado: ' + error.message });
    }
  }
};

module.exports = userController;
