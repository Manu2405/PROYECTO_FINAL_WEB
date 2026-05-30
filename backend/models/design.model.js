const db = require('../config/db');

const Design = {
  async getAll(filters = {}) {
    let query = `
      SELECT d.*, u.nombre as artista_nombre, u.apellido as artista_apellido
      FROM disenos d
      INNER JOIN usuarios u ON d.id_artista = u.id_usuario
      WHERE 1=1
    `;
    const params = [];

    if (filters.visibleOnly !== false) {
      query += ' AND d.visible_portafolio = TRUE';
    }

    if (filters.estilo) {
      query += ' AND d.estilo = ?';
      params.push(filters.estilo);
    }

    if (filters.id_artista) {
      query += ' AND d.id_artista = ?';
      params.push(filters.id_artista);
    }

    query += ' ORDER BY d.id_diseno DESC';

    const [rows] = await db.query(query, params);
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query(`
      SELECT d.*, u.nombre as artista_nombre, u.apellido as artista_apellido
      FROM disenos d
      INNER JOIN usuarios u ON d.id_artista = u.id_usuario
      WHERE d.id_diseno = ?
    `, [id]);
    return rows[0] || null;
  },

  async getByArtist(artistId) {
    const [rows] = await db.query(
      'SELECT * FROM disenos WHERE id_artista = ? ORDER BY id_diseno DESC',
      [artistId]
    );
    return rows;
  },

  async create(data) {
    const { id_artista, titulo, descripcion, imagen_url, estilo, precio_referencia, visible_portafolio } = data;
    const [result] = await db.query(
      `INSERT INTO disenos (id_artista, titulo, descripcion, imagen_url, estilo, precio_referencia, visible_portafolio)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_artista, titulo, descripcion, imagen_url, estilo || null, precio_referencia || 0, visible_portafolio !== undefined ? visible_portafolio : true]
    );
    return result.insertId;
  },

  async update(id, data) {
    const { titulo, descripcion, imagen_url, estilo, precio_referencia, visible_portafolio } = data;
    await db.query(
      `UPDATE disenos 
       SET titulo = ?, descripcion = ?, imagen_url = COALESCE(?, imagen_url), estilo = ?, precio_referencia = ?, visible_portafolio = ?
       WHERE id_diseno = ?`,
      [titulo, descripcion, imagen_url || null, estilo || null, precio_referencia || 0, visible_portafolio !== undefined ? visible_portafolio : true, id]
    );
    return true;
  },

  async delete(id) {
    await db.query('DELETE FROM disenos WHERE id_diseno = ?', [id]);
    return true;
  },

  async likeDesign(id) {
    await db.query('UPDATE disenos SET likes = likes + 1 WHERE id_diseno = ?', [id]);
    return true;
  }
};

module.exports = Design;
