const db = require('../config/db');

const Design = {
  async getAll(filters = {}) {
    let query = `
      SELECT d.*, u.nombre as artista_nombre, u.apellido as artista_apellido, u.foto_url as artista_foto_url
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

    if (filters.sort === 'likes') {
      query += ' ORDER BY d.likes DESC, d.id_diseno DESC';
    } else if (filters.sort === 'newest') {
      query += ' ORDER BY d.fecha_creacion DESC, d.id_diseno DESC';
    } else {
      query += ' ORDER BY d.id_diseno DESC';
    }

    const [rows] = await db.query(query, params);
    return rows;
  },

  async getLikedByUser(userId, designIds) {
    if (!userId || !designIds.length) return [];
    const placeholders = designIds.map(() => '?').join(',');
    const [rows] = await db.query(
      `SELECT id_diseno FROM diseno_likes WHERE id_usuario = ? AND id_diseno IN (${placeholders})`,
      [userId, ...designIds]
    );
    return rows.map((r) => r.id_diseno);
  },

  async toggleLike(designId, userId) {
    const [existing] = await db.query(
      'SELECT id_diseno_like FROM diseno_likes WHERE id_diseno = ? AND id_usuario = ?',
      [designId, userId]
    );
    if (existing.length) {
      await db.query('DELETE FROM diseno_likes WHERE id_diseno = ? AND id_usuario = ?', [designId, userId]);
      await db.query('UPDATE disenos SET likes = GREATEST(likes - 1, 0) WHERE id_diseno = ?', [designId]);
      return { liked: false };
    }
    await db.query('INSERT INTO diseno_likes (id_usuario, id_diseno) VALUES (?, ?)', [userId, designId]);
    await db.query('UPDATE disenos SET likes = likes + 1 WHERE id_diseno = ?', [designId]);
    return { liked: true };
  },

  async getById(id) {
    const [rows] = await db.query(`
      SELECT d.*, u.nombre as artista_nombre, u.apellido as artista_apellido, u.foto_url as artista_foto_url
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

  async getLikeCount(id) {
    const [rows] = await db.query('SELECT likes FROM disenos WHERE id_diseno = ?', [id]);
    return rows[0]?.likes || 0;
  },
};

module.exports = Design;
