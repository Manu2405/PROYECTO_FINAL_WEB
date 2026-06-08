const db = require('../config/db');

const User = {
  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query(`
      SELECT u.*, s.nombre as sucursal_nombre 
      FROM usuarios u 
      LEFT JOIN sucursales s ON u.id_sucursal = s.id_sucursal
      WHERE u.id_usuario = ?
    `, [id]);
    return rows[0] || null;
  },

  async getAll() {
    const [rows] = await db.query(`
      SELECT u.id_usuario, u.id_sucursal, u.nombre, u.apellido, u.email, u.telefono, u.foto_url, u.rol, u.estado, u.fecha_registro, s.nombre as sucursal_nombre
      FROM usuarios u
      LEFT JOIN sucursales s ON u.id_sucursal = s.id_sucursal
      ORDER BY u.id_usuario DESC
    `);
    return rows;
  },

  async getArtists() {
    const [rows] = await db.query(`
      SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.telefono, u.foto_url, u.biografia, u.id_sucursal, u.horario_inicio, u.horario_fin, u.whatsapp, s.nombre as sucursal_nombre
      FROM usuarios u
      LEFT JOIN sucursales s ON u.id_sucursal = s.id_sucursal
      WHERE u.rol = 'artista' AND u.estado = TRUE
      ORDER BY u.nombre ASC
    `);

    // Para cada artista, buscar sus especialidades
    const artistsWithSpecialties = [];
    for (const artist of rows) {
      const [specs] = await db.query(`
        SELECT e.id_especialidad, e.nombre, e.descripcion
        FROM especialidades e
        INNER JOIN usuario_especialidad ue ON e.id_especialidad = ue.id_especialidad
        WHERE ue.id_usuario = ?
      `, [artist.id_usuario]);
      
      artistsWithSpecialties.push({
        ...artist,
        especialidades: specs
      });
    }
    
    return artistsWithSpecialties;
  },

  async create(data) {
    const {
      nombre, apellido, email, password_hash, telefono, foto_url, biografia,
      fecha_nacimiento, rol, id_sucursal, horario_inicio, horario_fin, whatsapp,
    } = data;
    const [result] = await db.query(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, foto_url, biografia, fecha_nacimiento, rol, id_sucursal, horario_inicio, horario_fin, whatsapp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre, apellido, email, password_hash, telefono, foto_url || null,
        biografia || null, fecha_nacimiento || null, rol || 'cliente', id_sucursal || null,
        horario_inicio || (rol === 'artista' ? '10:00:00' : null),
        horario_fin || (rol === 'artista' ? '18:00:00' : null),
        whatsapp || '65242305',
      ]
    );
    return result.insertId;
  },

  async updateProfile(id, data) {
    const {
      nombre, apellido, telefono, foto_url, biografia, fecha_nacimiento,
      id_sucursal, horario_inicio, horario_fin,
    } = data;
    await db.query(
      `UPDATE usuarios
       SET nombre = ?, apellido = ?, telefono = ?, foto_url = COALESCE(?, foto_url),
           biografia = ?, fecha_nacimiento = ?, id_sucursal = ?,
           horario_inicio = COALESCE(?, horario_inicio),
           horario_fin = COALESCE(?, horario_fin)
       WHERE id_usuario = ?`,
      [
        nombre, apellido, telefono, foto_url || null, biografia || null,
        fecha_nacimiento || null, id_sucursal || null,
        horario_inicio || null, horario_fin || null, id,
      ]
    );
    return true;
  },

  async updateRole(id, rol, id_sucursal = null) {
    await db.query(
      'UPDATE usuarios SET rol = ?, id_sucursal = ? WHERE id_usuario = ?',
      [rol, id_sucursal, id]
    );
    return true;
  },

  async updateStatus(id, estado) {
    await db.query(
      'UPDATE usuarios SET estado = ? WHERE id_usuario = ?',
      [estado, id]
    );
    return true;
  },

  async updateLastLogin(id) {
    await db.query(
      'UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id_usuario = ?',
      [id]
    );
    return true;
  },

  async updateAdmin(id, data) {
    const { nombre, apellido, email, telefono, biografia, fecha_nacimiento, id_sucursal } = data;
    await db.query(
      `UPDATE usuarios
       SET nombre = ?, apellido = ?, email = ?, telefono = ?, biografia = ?, fecha_nacimiento = ?, id_sucursal = ?
       WHERE id_usuario = ?`,
      [nombre, apellido, email, telefono || null, biografia || null, fecha_nacimiento || null, id_sucursal || null, id]
    );
    return true;
  },

  async searchClients(query) {
    const q = `%${query}%`;
    const [rows] = await db.query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.email,
              COALESCE(n.nivel_actual, 'Bronce') AS nivel_actual,
              COALESCE(n.puntos_totales, 0) AS puntos_totales
       FROM usuarios u
       LEFT JOIN niveles_clientes n ON u.id_usuario = n.id_cliente
       WHERE u.rol = 'cliente' AND u.estado = TRUE
         AND (u.nombre LIKE ? OR u.apellido LIKE ? OR CONCAT(u.nombre, ' ', u.apellido) LIKE ?)
       ORDER BY u.nombre, u.apellido
       LIMIT 20`,
      [q, q, q]
    );
    return rows;
  },
};

module.exports = User;
