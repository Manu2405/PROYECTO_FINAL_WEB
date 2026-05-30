const db = require('../config/db');

const Publication = {
  async getAll(userId = null) {
    // Si pasamos userId, podemos incluir si este usuario ya votó y qué tipo de voto hizo
    let selectClause = `
      p.*, 
      c.nombre as cliente_nombre, c.apellido as cliente_apellido,
      a.nombre as artista_nombre, a.apellido as artista_apellido
    `;
    let joinClause = '';
    const params = [];

    if (userId) {
      selectClause += ', vp.tipo_voto as mi_voto';
      joinClause += ' LEFT JOIN votaciones_publicaciones vp ON p.id_publicacion = vp.id_publicacion AND vp.id_usuario_voto = ?';
      params.push(userId);
    }

    const query = `
      SELECT ${selectClause}
      FROM publicaciones_tatuajes p
      INNER JOIN usuarios c ON p.id_cliente = c.id_usuario
      INNER JOIN usuarios a ON p.id_artista = a.id_usuario
      ${joinClause}
      ORDER BY p.created_at DESC
    `;

    const [rows] = await db.query(query, params);
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query(`
      SELECT p.*, 
             c.nombre as cliente_nombre, c.apellido as cliente_apellido,
             a.nombre as artista_nombre, a.apellido as artista_apellido
      FROM publicaciones_tatuajes p
      INNER JOIN usuarios c ON p.id_cliente = c.id_usuario
      INNER JOIN usuarios a ON p.id_artista = a.id_usuario
      WHERE p.id_publicacion = ?
    `, [id]);
    return rows[0] || null;
  },

  async create(data) {
    const { id_cliente, id_artista, id_reserva, imagen_url, descripcion, fecha_tatuaje, zona_cuerpo } = data;
    const [result] = await db.query(
      `INSERT INTO publicaciones_tatuajes (id_cliente, id_artista, id_reserva, imagen_url, descripcion, fecha_tatuaje, zona_cuerpo, votos_positivos, votos_negativos)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)`,
      [id_cliente, id_artista, id_reserva || null, imagen_url, descripcion || null, fecha_tatuaje, zona_cuerpo || null]
    );
    return result.insertId;
  },

  async delete(id) {
    await db.query('DELETE FROM publicaciones_tatuajes WHERE id_publicacion = ?', [id]);
    return true;
  },

  async updateVoteCounts(id) {
    // Contar los votos positivos y negativos en la tabla de votaciones
    const [positives] = await db.query('SELECT COUNT(*) as count FROM votaciones_publicaciones WHERE id_publicacion = ? AND tipo_voto = "positivo"', [id]);
    const [negatives] = await db.query('SELECT COUNT(*) as count FROM votaciones_publicaciones WHERE id_publicacion = ? AND tipo_voto = "negativo"', [id]);
    
    const countPositives = positives[0].count;
    const countNegatives = negatives[0].count;

    // Actualizar la tabla principal
    await db.query(
      'UPDATE publicaciones_tatuajes SET votos_positivos = ?, votos_negativos = ? WHERE id_publicacion = ?',
      [countPositives, countNegatives, id]
    );

    return { votos_positivos: countPositives, votos_negativos: countNegatives };
  }
};

module.exports = Publication;
