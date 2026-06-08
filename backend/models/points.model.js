const db = require('../config/db');

const Points = {
  async getClientLevel(clientId) {
    const [rows] = await db.query(
      'SELECT * FROM niveles_clientes WHERE id_cliente = ?',
      [clientId]
    );
    return rows[0] || null;
  },

  async getPointsHistory(clientId) {
    const [rows] = await db.query(
      'SELECT * FROM historial_puntos WHERE id_cliente = ? ORDER BY fecha DESC',
      [clientId]
    );
    return rows;
  },

  async initializeClient(clientId) {
    await db.query(
      'INSERT IGNORE INTO niveles_clientes (id_cliente, nivel_actual, puntos_totales) VALUES (?, "Bronce", 0)',
      [clientId]
    );
    return true;
  },

  async addPoints(clientId, points, motive, referenceId = null) {
    // 1. Asegurar que el registro de nivel existe
    await this.initializeClient(clientId);

    // 2. Obtener puntos actuales
    const current = await this.getClientLevel(clientId);
    const currentPoints = current ? current.puntos_totales : 0;
    const newTotal = currentPoints + points;

    // 3. Determinar nivel basado en puntos acumulados
    // Bronce: 0 - 99 pts
    // Plata: 100 - 299 pts
    // Oro: 300 - 999 pts
    // Diamante: 1000+ pts
    let tier = 'Bronce';
    if (newTotal >= 1000) {
      tier = 'Diamante';
    } else if (newTotal >= 300) {
      tier = 'Oro';
    } else if (newTotal >= 100) {
      tier = 'Plata';
    }

    // 4. Actualizar tabla de niveles
    await db.query(
      `UPDATE niveles_clientes 
       SET nivel_actual = ?, puntos_totales = ?, fecha_ultima_actividad = CURRENT_TIMESTAMP
       WHERE id_cliente = ?`,
      [tier, newTotal, clientId]
    );

    // 5. Registrar en el historial de puntos
    await db.query(
      'INSERT INTO historial_puntos (id_cliente, puntos, motivo, referencia_id) VALUES (?, ?, ?, ?)',
      [clientId, points, motive, referenceId]
    );

    return { nivel_actual: tier, puntos_totales: newTotal };
  },

  async redeemDiscount(clientId, bloques) {
    await this.initializeClient(clientId);
    const current = await this.getClientLevel(clientId);

    if (current.descuento_pendiente > 0) {
      throw new Error('Ya tienes un descuento pendiente para tu proxima reserva');
    }

    const bloquesNum = parseInt(bloques);
    if (!bloquesNum || bloquesNum < 1 || bloquesNum > 3) {
      throw new Error('Debes canjear entre 1 y 3 bloques (10% a 30%)');
    }

    const puntosNecesarios = bloquesNum * 100;
    const descuento = bloquesNum * 10;

    if (current.puntos_totales < puntosNecesarios) {
      throw new Error('No tienes suficientes puntos');
    }

    await this.addPoints(clientId, -puntosNecesarios, `Canje de descuento ${descuento}%`, null);

    await db.query(
      'UPDATE niveles_clientes SET descuento_pendiente = ? WHERE id_cliente = ?',
      [descuento, clientId]
    );

    const updated = await this.getClientLevel(clientId);
    return { descuento_pendiente: descuento, puntos_usados: puntosNecesarios, fidelidad: updated };
  },

  async clearPendingDiscount(clientId) {
    await db.query(
      'UPDATE niveles_clientes SET descuento_pendiente = 0 WHERE id_cliente = ?',
      [clientId]
    );
  }
};

module.exports = Points;
