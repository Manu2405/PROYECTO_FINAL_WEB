const db = require('../config/db');

const Invitation = {
  async findByToken(token) {
    const [rows] = await db.query(
      'SELECT * FROM invitaciones_registro WHERE token = ? AND expires_at > NOW()',
      [token]
    );
    return rows[0] || null;
  },

  async findByTokenAny(token) {
    const [rows] = await db.query(
      'SELECT * FROM invitaciones_registro WHERE token = ?',
      [token]
    );
    return rows[0] || null;
  },

  async findPendingByEmail(email) {
    const [rows] = await db.query(
      'SELECT * FROM invitaciones_registro WHERE email = ? AND expires_at > NOW()',
      [email]
    );
    return rows[0] || null;
  },

  async create(data) {
    const {
      token, nombre, apellido, email, password_hash, telefono,
      biografia, fecha_nacimiento, rol, id_sucursal, horario_inicio, horario_fin,
      creado_por, expires_at,
    } = data;

    const [result] = await db.query(
      `INSERT INTO invitaciones_registro
       (token, nombre, apellido, email, password_hash, telefono, biografia, fecha_nacimiento, rol, id_sucursal, horario_inicio, horario_fin, creado_por, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        token, nombre, apellido, email, password_hash,
        telefono || null, biografia || null, fecha_nacimiento || null,
        rol, id_sucursal || null, horario_inicio || null, horario_fin || null,
        creado_por || null, expires_at,
      ]
    );
    return result.insertId;
  },

  async deleteByToken(token) {
    await db.query('DELETE FROM invitaciones_registro WHERE token = ?', [token]);
    return true;
  },

  async deleteByEmail(email) {
    await db.query('DELETE FROM invitaciones_registro WHERE email = ?', [email]);
    return true;
  },
};

module.exports = Invitation;
