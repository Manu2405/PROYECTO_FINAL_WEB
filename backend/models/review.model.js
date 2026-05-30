const db = require('../config/db');

const Review = {
  async getAll() {
    const [rows] = await db.query(`
      SELECT r.*, 
             c.nombre as cliente_nombre, c.apellido as cliente_apellido, c.foto_url as cliente_foto_url,
             a.nombre as artista_nombre, a.apellido as artista_apellido
      FROM resenas r
      INNER JOIN usuarios c ON r.id_cliente = c.id_usuario
      INNER JOIN usuarios a ON r.id_artista = a.id_usuario
      ORDER BY r.fecha DESC
    `);
    return rows;
  },

  async getByArtist(artistId) {
    const [rows] = await db.query(`
      SELECT r.*, c.nombre as cliente_nombre, c.apellido as cliente_apellido, c.foto_url as cliente_foto_url
      FROM resenas r
      INNER JOIN usuarios c ON r.id_cliente = c.id_usuario
      WHERE r.id_artista = ? AND r.estado = TRUE
      ORDER BY r.fecha DESC
    `, [artistId]);
    return rows;
  },

  async getByBooking(bookingId) {
    const [rows] = await db.query(
      'SELECT * FROM resenas WHERE id_reserva = ?',
      [bookingId]
    );
    return rows[0] || null;
  },

  async create(data) {
    const { id_cliente, id_artista, id_reserva, puntuacion, comentario } = data;
    const [result] = await db.query(
      `INSERT INTO resenas (id_cliente, id_artista, id_reserva, puntuacion, comentario, estado)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [id_cliente, id_artista, id_reserva, puntuacion, comentario]
    );
    return result.insertId;
  },

  async updateStatus(id, estado) {
    await db.query('UPDATE resenas SET estado = ? WHERE id_resena = ?', [estado, id]);
    return true;
  }
};

module.exports = Review;
