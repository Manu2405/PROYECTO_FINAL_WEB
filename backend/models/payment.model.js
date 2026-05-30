const db = require('../config/db');

const Payment = {
  async getAll() {
    const [rows] = await db.query(`
      SELECT p.*, r.id_cliente, c.nombre as cliente_nombre, c.apellido as cliente_apellido
      FROM pagos p
      INNER JOIN reservas r ON p.id_reserva = r.id_reserva
      INNER JOIN usuarios c ON r.id_cliente = c.id_usuario
      ORDER BY p.fecha_pago DESC
    `);
    return rows;
  },

  async getByBooking(bookingId) {
    const [rows] = await db.query(
      'SELECT * FROM pagos WHERE id_reserva = ? ORDER BY fecha_pago DESC',
      [bookingId]
    );
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query(`
      SELECT p.*, r.id_cliente 
      FROM pagos p
      INNER JOIN reservas r ON p.id_reserva = r.id_reserva
      WHERE p.id_pago = ?
    `, [id]);
    return rows[0] || null;
  },

  async create(data) {
    const { id_reserva, monto, metodo_pago, comprobante_url, referencia_transaccion, estado } = data;
    const [result] = await db.query(
      `INSERT INTO pagos (id_reserva, monto, metodo_pago, comprobante_url, referencia_transaccion, estado)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_reserva, monto, metodo_pago, comprobante_url || null, referencia_transaccion || null, estado || 'pagado']
    );
    return result.insertId;
  },

  async updateStatus(id, estado) {
    await db.query('UPDATE pagos SET estado = ? WHERE id_pago = ?', [estado, id]);
    return true;
  }
};

module.exports = Payment;
