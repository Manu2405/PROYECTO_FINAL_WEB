const crypto = require('crypto');
const User = require('../models/user.model');
const Invitation = require('../models/invitation.model');
const Points = require('../models/points.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { uploadToCloudinary } = require('../middlewares/upload');
const { sendConfirmationEmail } = require('../services/email.service');
require('dotenv').config();

async function createInvitationAndSendEmail(data, creado_por = null) {
  const {
    nombre, apellido, email, password_hash, telefono, biografia, fecha_nacimiento,
    rol, id_sucursal, horario_inicio, horario_fin,
  } = data;

  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new Error('El correo electrónico ya está registrado');
  }

  const pending = await Invitation.findPendingByEmail(email);
  if (pending) {
    const elapsedMs = Date.now() - new Date(pending.created_at).getTime();
    const resendAfterMs = 15 * 60 * 1000;
    if (elapsedMs < resendAfterMs) {
      const waitMinutes = Math.ceil((resendAfterMs - elapsedMs) / 60000);
      throw new Error(`Ya enviamos un correo a esta dirección. Puedes reenviar en ${waitMinutes} minuto(s).`);
    }
    await Invitation.deleteByEmail(email);
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires_at = new Date(Date.now() + 48 * 60 * 60 * 1000);

  await Invitation.create({
    token,
    nombre,
    apellido,
    email,
    password_hash,
    telefono,
    biografia,
    fecha_nacimiento,
    rol,
    id_sucursal,
    horario_inicio,
    horario_fin,
    creado_por,
    expires_at,
  });

  try {
    await sendConfirmationEmail(email, token, nombre);
  } catch (err) {
    await Invitation.deleteByToken(token);
    throw err;
  }
}

const userController = {
  async register(req, res) {
    try {
      const { nombre, apellido, email, password, telefono, biografia, fecha_nacimiento } = req.body;

      if (!nombre || !apellido || !email || !password) {
        return res.status(400).json({ error: 'Nombre, apellido, email y contraseña son obligatorios' });
      }

      const password_hash = await bcrypt.hash(password, 10);

      await createInvitationAndSendEmail({
        nombre,
        apellido,
        email,
        password_hash,
        telefono,
        biografia,
        fecha_nacimiento,
        rol: 'cliente',
        id_sucursal: null,
      });

      res.status(201).json({
        message: 'Te enviamos un correo de confirmación. Revisa tu bandeja para activar tu cuenta.',
      });
    } catch (error) {
      const status = error.message.includes('ya está') || error.message.includes('reenviar') ? 400 : 500;
      res.status(status).json({ error: error.message });
    }
  },

  async confirmAccount(req, res) {
    try {
      const { token } = req.params;
      const invitation = await Invitation.findByTokenAny(token);

      if (!invitation) {
        return res.status(400).json({ error: 'El enlace de confirmación no es válido.' });
      }

      const existingUser = await User.findByEmail(invitation.email);
      if (existingUser) {
        return res.json({ message: 'Cuenta confirmada con éxito. Ya puedes iniciar sesión.' });
      }

      if (new Date(invitation.expires_at) < new Date()) {
        return res.status(400).json({ error: 'El enlace de confirmación ha expirado. Regístrate de nuevo para recibir un correo nuevo.' });
      }

      const userId = await User.create({
        nombre: invitation.nombre,
        apellido: invitation.apellido,
        email: invitation.email,
        password_hash: invitation.password_hash,
        telefono: invitation.telefono,
        foto_url: null,
        biografia: invitation.biografia,
        fecha_nacimiento: invitation.fecha_nacimiento,
        rol: invitation.rol,
        id_sucursal: invitation.rol === 'artista' ? invitation.id_sucursal : null,
        horario_inicio: invitation.horario_inicio,
        horario_fin: invitation.horario_fin,
      });

      if (invitation.rol === 'cliente') {
        await Points.initializeClient(userId);
      }

      await Invitation.deleteByToken(token);

      res.json({ message: 'Cuenta confirmada con éxito. Ya puedes iniciar sesión.' });
    } catch (error) {
      res.status(500).json({ error: 'Error al confirmar la cuenta: ' + error.message });
    }
  },

  async createUserAdmin(req, res) {
    try {
      const {
        nombre, apellido, email, password, telefono, biografia, fecha_nacimiento,
        rol, id_sucursal, horario_inicio, horario_fin,
      } = req.body;

      if (!nombre || !apellido || !email || !password || !rol) {
        return res.status(400).json({ error: 'Nombre, apellido, email, contraseña y rol son obligatorios' });
      }

      if (!['cliente', 'artista', 'admin'].includes(rol)) {
        return res.status(400).json({ error: 'Rol no válido' });
      }

      if (rol === 'artista' && !id_sucursal) {
        return res.status(400).json({ error: 'Debes seleccionar una sucursal para el artista' });
      }
      if (rol === 'artista' && (!horario_inicio || !horario_fin)) {
        return res.status(400).json({ error: 'Debes indicar el horario de trabajo del artista' });
      }

      const password_hash = await bcrypt.hash(password, 10);

      await createInvitationAndSendEmail({
        nombre,
        apellido,
        email,
        password_hash,
        telefono,
        biografia,
        fecha_nacimiento,
        rol,
        id_sucursal: rol === 'artista' ? id_sucursal : null,
        horario_inicio: rol === 'artista' ? horario_inicio : null,
        horario_fin: rol === 'artista' ? horario_fin : null,
      }, req.user.id_usuario);

      res.status(201).json({
        message: `Se envió un correo de confirmación a ${email}. La cuenta se activará cuando confirme el enlace.`,
      });
    } catch (error) {
      const status = error.message.includes('ya está') || error.message.includes('reenviar') ? 400 : 500;
      res.status(status).json({ error: error.message });
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
        const pending = await Invitation.findPendingByEmail(email);
        if (pending) {
          return res.status(403).json({
            error: 'Tu cuenta aún no está confirmada. Revisa tu correo y haz clic en el enlace de activación.',
          });
        }
        return res.status(401).json({ error: 'Credenciales incorrectas (usuario no encontrado)' });
      }

      if (!user.estado) {
        return res.status(403).json({ error: 'Esta cuenta ha sido desactivada. Póngase en contacto con el administrador.' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Credenciales incorrectas (contraseña incorrecta)' });
      }

      await User.updateLastLogin(user.id_usuario);

      const token = jwt.sign(
        {
          id_usuario: user.id_usuario,
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          rol: user.rol,
          id_sucursal: user.id_sucursal,
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
          foto_url: user.foto_url,
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al iniciar sesión: ' + error.message });
    }
  },

  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id_usuario);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      delete user.password_hash;
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el perfil: ' + error.message });
    }
  },

  async updateProfile(req, res) {
    try {
      const userId = req.user.id_usuario;
      const { nombre, apellido, telefono, biografia, fecha_nacimiento, id_sucursal, horario_inicio, horario_fin } = req.body;

      if (!nombre || !apellido) {
        return res.status(400).json({ error: 'Nombre y apellido son obligatorios' });
      }

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
        id_sucursal: req.user.rol === 'artista' ? id_sucursal : null,
        horario_inicio: req.user.rol === 'artista' ? horario_inicio : null,
        horario_fin: req.user.rol === 'artista' ? horario_fin : null,
      });

      const updated = await User.findById(userId);
      res.json({ message: 'Perfil actualizado con éxito', foto_url: updated.foto_url });
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
      users.forEach((u) => delete u.password_hash);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los usuarios: ' + error.message });
    }
  },

  async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      delete user.password_hash;
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el usuario: ' + error.message });
    }
  },

  async updateUserAdmin(req, res) {
    try {
      const { nombre, apellido, email, telefono, biografia, fecha_nacimiento, id_sucursal } = req.body;
      const { id } = req.params;

      if (!nombre || !apellido || !email) {
        return res.status(400).json({ error: 'Nombre, apellido y email son obligatorios' });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const emailTaken = await User.findByEmail(email);
      if (emailTaken && emailTaken.id_usuario !== parseInt(id, 10)) {
        return res.status(400).json({ error: 'El correo electrónico ya está en uso' });
      }

      await User.updateAdmin(id, {
        nombre,
        apellido,
        email,
        telefono,
        biografia,
        fecha_nacimiento,
        id_sucursal: user.rol === 'artista' ? id_sucursal : null,
      });

      res.json({ message: 'Usuario actualizado con éxito' });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el usuario: ' + error.message });
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
      res.json({
        message: estado ? 'Usuario activado' : 'Usuario desactivado',
        usuario: { nombre: user.nombre, apellido: user.apellido, estado },
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el estado: ' + error.message });
    }
  },
};

module.exports = userController;
