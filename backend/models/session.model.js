const db = require('../config/db');

const Session = {
  async getByBooking(bookingId) {
    const [rows] = await db.query(
      'SELECT * FROM sesiones WHERE id_reserva = ? ORDER BY numero_sesion ASC',
      [bookingId]
    );
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM sesiones WHERE id_sesion = ?', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const { id_reserva, numero_sesion, fecha_inicio, fecha_fin, duracion_horas, observaciones } = data;
    const [result] = await db.query(
      `INSERT INTO sesiones (id_reserva, numero_sesion, fecha_inicio, fecha_fin, duracion_horas, observaciones, estado)
       VALUES (?, ?, ?, ?, ?, ?, 'programada')`,
      [id_reserva, numero_sesion, fecha_inicio, fecha_fin, duracion_horas || null, observaciones || null]
    );
    return result.insertId;
  },

  async update(id, data) {
    const { numero_sesion, fecha_inicio, fecha_fin, duracion_horas, observaciones, estado } = data;
    await db.query(
      `UPDATE sesiones 
       SET numero_sesion = ?, fecha_inicio = ?, fecha_fin = ?, duracion_horas = ?, observaciones = ?, estado = ?
       WHERE id_sesion = ?`,
      [numero_sesion, fecha_inicio, fecha_fin, duracion_horas || null, observaciones || null, estado || 'programada', id]
    );
    return true;
  },

  async delete(id) {
    await db.query('DELETE FROM sesiones WHERE id_sesion = ?', [id]);
    return true;
  }
};

module.exports = Session;
