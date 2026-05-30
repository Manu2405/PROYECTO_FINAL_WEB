const db = require('../config/db');

const Booking = {
  async getAll() {
    const [rows] = await db.query(`
      SELECT r.*, 
             c.nombre as cliente_nombre, c.apellido as cliente_apellido, c.email as cliente_email,
             a.nombre as artista_nombre, a.apellido as artista_apellido,
             d.titulo as diseno_titulo, d.imagen_url as diseno_imagen_url
      FROM reservas r
      INNER JOIN usuarios c ON r.id_cliente = c.id_usuario
      INNER JOIN usuarios a ON r.id_artista = a.id_usuario
      LEFT JOIN disenos d ON r.id_diseno = d.id_diseno
      ORDER BY r.fecha_reserva DESC
    `);
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query(`
      SELECT r.*, 
             c.nombre as cliente_nombre, c.apellido as cliente_apellido, c.email as cliente_email,
             a.nombre as artista_nombre, a.apellido as artista_apellido,
             d.titulo as diseno_titulo, d.imagen_url as diseno_imagen_url
      FROM reservas r
      INNER JOIN usuarios c ON r.id_cliente = c.id_usuario
      INNER JOIN usuarios a ON r.id_artista = a.id_usuario
      LEFT JOIN disenos d ON r.id_diseno = d.id_diseno
      WHERE r.id_reserva = ?
    `, [id]);
    return rows[0] || null;
  },

  async getByClient(clientId) {
    const [rows] = await db.query(`
      SELECT r.*, 
             a.nombre as artista_nombre, a.apellido as artista_apellido, a.foto_url as artista_foto,
             d.titulo as diseno_titulo, d.imagen_url as diseno_imagen_url
      FROM reservas r
      INNER JOIN usuarios a ON r.id_artista = a.id_usuario
      LEFT JOIN disenos d ON r.id_diseno = d.id_diseno
      WHERE r.id_cliente = ?
      ORDER BY r.fecha_reserva DESC
    `, [clientId]);
    return rows;
  },

  async getByArtist(artistId) {
    const [rows] = await db.query(`
      SELECT r.*, 
             c.nombre as cliente_nombre, c.apellido as cliente_apellido, c.email as cliente_email, c.telefono as cliente_telefono,
             d.titulo as diseno_titulo, d.imagen_url as diseno_imagen_url
      FROM reservas r
      INNER JOIN usuarios c ON r.id_cliente = c.id_usuario
      LEFT JOIN disenos d ON r.id_diseno = d.id_diseno
      WHERE r.id_artista = ?
      ORDER BY r.fecha_reserva DESC
    `, [artistId]);
    return rows;
  },

  async create(data) {
    const { id_cliente, id_artista, id_diseno, fecha_reserva, zona_cuerpo, tamano, descripcion, imagen_referencia_url, precio_estimado, adelanto } = data;
    const [result] = await db.query(
      `INSERT INTO reservas (id_cliente, id_artista, id_diseno, fecha_reserva, zona_cuerpo, tamano, descripcion, imagen_referencia_url, precio_estimado, adelanto, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
      [id_cliente, id_artista, id_diseno || null, fecha_reserva, zona_cuerpo, tamano, descripcion || null, imagen_referencia_url || null, precio_estimado || 0, adelanto || 0]
    );
    return result.insertId;
  },

  async updateStatus(id, estado, observaciones = null) {
    const query = observaciones !== null
      ? 'UPDATE reservas SET estado = ?, observaciones = ? WHERE id_reserva = ?'
      : 'UPDATE reservas SET estado = ? WHERE id_reserva = ?';
    const params = observaciones !== null ? [estado, observaciones, id] : [estado, id];
    
    await db.query(query, params);
    return true;
  },

  async updateEstimation(id, precio_estimado, adelanto) {
    await db.query(
      'UPDATE reservas SET precio_estimado = ?, adelanto = ? WHERE id_reserva = ?',
      [precio_estimado, adelanto, id]
    );
    return true;
  }
};

module.exports = Booking;
