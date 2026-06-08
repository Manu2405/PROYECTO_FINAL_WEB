const db = require('../config/db');

const Branch = {
  async attachImages(branches) {
    if (!branches.length) return branches;
    const ids = branches.map((b) => b.id_sucursal);
    const [imgs] = await db.query(
      `SELECT * FROM sucursal_imagenes WHERE id_sucursal IN (${ids.map(() => '?').join(',')}) ORDER BY orden ASC`,
      ids
    );
    return branches.map((b) => ({
      ...b,
      imagenes: imgs.filter((i) => i.id_sucursal === b.id_sucursal).map((i) => i.imagen_url),
    }));
  },

  async getImages(branchId) {
    const [rows] = await db.query(
      'SELECT * FROM sucursal_imagenes WHERE id_sucursal = ? ORDER BY orden ASC',
      [branchId]
    );
    return rows;
  },

  async setImages(branchId, urls) {
    await db.query('DELETE FROM sucursal_imagenes WHERE id_sucursal = ?', [branchId]);
    const list = (urls || []).filter(Boolean).slice(0, 5);
    for (let i = 0; i < list.length; i++) {
      await db.query(
        'INSERT INTO sucursal_imagenes (id_sucursal, imagen_url, orden) VALUES (?, ?, ?)',
        [branchId, list[i], i]
      );
    }
    if (list[0]) {
      await db.query('UPDATE sucursales SET imagen_url = ? WHERE id_sucursal = ?', [list[0], branchId]);
    }
  },

  async getAll() {
    const [rows] = await db.query('SELECT * FROM sucursales WHERE estado = TRUE ORDER BY id_sucursal DESC');
    return this.attachImages(rows);
  },

  async getAllAdmin() {
    const [rows] = await db.query('SELECT * FROM sucursales ORDER BY id_sucursal DESC');
    return this.attachImages(rows);
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM sucursales WHERE id_sucursal = ?', [id]);
    const branch = rows[0] || null;
    if (!branch) return null;
    const imagenes = await this.getImages(id);
    return {
      ...branch,
      imagenes: imagenes.length ? imagenes.map((i) => i.imagen_url) : (branch.imagen_url ? [branch.imagen_url] : []),
    };
  },

  async create(data) {
    const { nombre, descripcion, direccion, latitud, longitud, telefono, email, imagen_url, horario_apertura, horario_cierre, imagenes } = data;
    const [result] = await db.query(
      `INSERT INTO sucursales (nombre, descripcion, direccion, latitud, longitud, telefono, email, imagen_url, horario_apertura, horario_cierre)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, direccion, latitud, longitud, telefono, email, imagen_url || imagenes?.[0] || null, horario_apertura, horario_cierre]
    );
    if (imagenes?.length) await this.setImages(result.insertId, imagenes);
    return result.insertId;
  },

  async update(id, data) {
    const { nombre, descripcion, direccion, latitud, longitud, telefono, email, imagen_url, horario_apertura, horario_cierre, estado, imagenes } = data;
    await db.query(
      `UPDATE sucursales
       SET nombre = ?, descripcion = ?, direccion = ?, latitud = ?, longitud = ?, telefono = ?, email = ?,
           imagen_url = COALESCE(?, imagen_url), horario_apertura = ?, horario_cierre = ?, estado = ?
       WHERE id_sucursal = ?`,
      [
        nombre, descripcion, direccion, latitud, longitud, telefono, email,
        imagen_url || imagenes?.[0] || null, horario_apertura, horario_cierre,
        estado !== undefined ? estado : true, id,
      ]
    );
    if (imagenes) await this.setImages(id, imagenes);
    return true;
  },

  async delete(id) {
    await db.query('UPDATE sucursales SET estado = FALSE WHERE id_sucursal = ?', [id]);
    return true;
  },
};

module.exports = Branch;
