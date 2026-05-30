const db = require('../config/db');

const Specialty = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM especialidades ORDER BY nombre ASC');
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM especialidades WHERE id_especialidad = ?', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const { nombre, descripcion } = data;
    const [result] = await db.query(
      'INSERT INTO especialidades (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion]
    );
    return result.insertId;
  },

  async update(id, data) {
    const { nombre, descripcion } = data;
    await db.query(
      'UPDATE especialidades SET nombre = ?, descripcion = ? WHERE id_especialidad = ?',
      [nombre, descripcion, id]
    );
    return true;
  },

  async delete(id) {
    await db.query('DELETE FROM especialidades WHERE id_especialidad = ?', [id]);
    return true;
  },

  async addArtistSpecialty(artistId, specialtyId) {
    await db.query(
      'INSERT IGNORE INTO usuario_especialidad (id_usuario, id_especialidad) VALUES (?, ?)',
      [artistId, specialtyId]
    );
    return true;
  },

  async removeArtistSpecialty(artistId, specialtyId) {
    await db.query(
      'DELETE FROM usuario_especialidad WHERE id_usuario = ? AND id_especialidad = ?',
      [artistId, specialtyId]
    );
    return true;
  },

  async getArtistSpecialties(artistId) {
    const [rows] = await db.query(`
      SELECT e.* 
      FROM especialidades e
      INNER JOIN usuario_especialidad ue ON e.id_especialidad = ue.id_especialidad
      WHERE ue.id_usuario = ?
    `, [artistId]);
    return rows;
  },

  async setArtistSpecialties(artistId, specialtyIds) {
    // 1. Eliminar especialidades existentes
    await db.query('DELETE FROM usuario_especialidad WHERE id_usuario = ?', [artistId]);
    
    // 2. Insertar las nuevas especialidades si las hay
    if (specialtyIds && specialtyIds.length > 0) {
      const values = specialtyIds.map(specId => [artistId, specId]);
      await db.query(
        'INSERT INTO usuario_especialidad (id_usuario, id_especialidad) VALUES ?',
        [values]
      );
    }
    return true;
  }
};

module.exports = Specialty;
