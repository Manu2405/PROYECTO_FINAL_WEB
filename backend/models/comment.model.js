const db = require('../config/db');

const Comment = {
  async getByPublication(publicationId) {
    const [rows] = await db.query(`
      SELECT c.*, 
             u.nombre as usuario_nombre, 
             u.apellido as usuario_apellido
      FROM comentarios_publicaciones c
      INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
      WHERE c.id_publicacion = ?
      ORDER BY c.created_at ASC
    `, [publicationId]);
    return rows;
  },

  async create(data) {
    const { id_publicacion, id_usuario, contenido } = data;
    const [result] = await db.query(
      `INSERT INTO comentarios_publicaciones (id_publicacion, id_usuario, contenido)
       VALUES (?, ?, ?)`,
      [id_publicacion, id_usuario, contenido]
    );
    return result.insertId;
  },

  async delete(id) {
    await db.query('DELETE FROM comentarios_publicaciones WHERE id_comentario = ?', [id]);
    return true;
  }
};

module.exports = Comment;
