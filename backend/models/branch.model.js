const db = require('../config/db');

const Branch = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM sucursales WHERE estado = TRUE ORDER BY id_sucursal DESC');
    return rows;
  },

  async getAllAdmin() {
    const [rows] = await db.query('SELECT * FROM sucursales ORDER BY id_sucursal DESC');
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM sucursales WHERE id_sucursal = ?', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const { nombre, descripcion, direccion, latitud, longitud, telefono, email, imagen_url, horario_apertura, horario_cierre } = data;
    const [result] = await db.query(
      `INSERT INTO sucursales (nombre, descripcion, direccion, latitud, longitud, telefono, email, imagen_url, horario_apertura, horario_cierre)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, direccion, latitud, longitud, telefono, email, imagen_url, horario_apertura, horario_cierre]
    );
    return result.insertId;
  },

  async update(id, data) {
    const { nombre, descripcion, direccion, latitud, longitud, telefono, email, imagen_url, horario_apertura, horario_cierre, estado } = data;
    await db.query(
      `UPDATE sucursales 
       SET nombre = ?, descripcion = ?, direccion = ?, latitud = ?, longitud = ?, telefono = ?, email = ?, imagen_url = ?, horario_apertura = ?, horario_cierre = ?, estado = ?
       WHERE id_sucursal = ?`,
      [nombre, descripcion, direccion, latitud, longitud, telefono, email, imagen_url, horario_apertura, horario_cierre, estado !== undefined ? estado : true, id]
    );
    return true;
  },

  async delete(id) {
    // Eliminar lógicamente cambiando el estado a false
    await db.query('UPDATE sucursales SET estado = FALSE WHERE id_sucursal = ?', [id]);
    return true;
  }
};

module.exports = Branch;
