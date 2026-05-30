const db = require('../config/db');

const Vote = {
  async getVote(publicationId, userId) {
    const [rows] = await db.query(
      'SELECT * FROM votaciones_publicaciones WHERE id_publicacion = ? AND id_usuario_voto = ?',
      [publicationId, userId]
    );
    return rows[0] || null;
  },

  async vote(publicationId, userId, type) {
    // Verificar si el voto ya existe
    const existing = await this.getVote(publicationId, userId);

    if (existing) {
      if (existing.tipo_voto === type) {
        // Si es el mismo tipo de voto, quitar el voto (alternar/toggle off)
        await db.query(
          'DELETE FROM votaciones_publicaciones WHERE id_publicacion = ? AND id_usuario_voto = ?',
          [publicationId, userId]
        );
        return 'removed';
      } else {
        // Si es un tipo de voto diferente, actualizarlo
        await db.query(
          'UPDATE votaciones_publicaciones SET tipo_voto = ? WHERE id_publicacion = ? AND id_usuario_voto = ?',
          [type, publicationId, userId]
        );
        return 'updated';
      }
    } else {
      // Insertar nuevo voto
      await db.query(
        'INSERT INTO votaciones_publicaciones (id_publicacion, id_usuario_voto, tipo_voto) VALUES (?, ?, ?)',
        [publicationId, userId, type]
      );
      return 'created';
    }
  }
};

module.exports = Vote;
