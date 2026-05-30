const Branch = require('../models/branch.model');

const branchController = {
  async getAll(req, res) {
    try {
      const branches = await Branch.getAll();
      res.json(branches);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las sucursales: ' + error.message });
    }
  },

  async getAllAdmin(req, res) {
    try {
      const branches = await Branch.getAllAdmin();
      res.json(branches);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las sucursales (admin): ' + error.message });
    }
  },

  async getById(req, res) {
    try {
      const branch = await Branch.getById(req.params.id);
      if (!branch) {
        return res.status(404).json({ error: 'Sucursal no encontrada' });
      }
      res.json(branch);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener la sucursal: ' + error.message });
    }
  },

  async create(req, res) {
    try {
      const { nombre, direccion, latitud, longitud } = req.body;
      if (!nombre || !direccion || latitud === undefined || longitud === undefined) {
        return res.status(400).json({ error: 'Nombre, dirección, latitud y longitud son requeridos' });
      }

      const branchId = await Branch.create(req.body);
      res.status(201).json({ message: 'Sucursal creada con éxito', id: branchId });
    } catch (error) {
      res.status(500).json({ error: 'Error al crear la sucursal: ' + error.message });
    }
  },

  async update(req, res) {
    try {
      const { nombre, direccion, latitud, longitud } = req.body;
      if (!nombre || !direccion || latitud === undefined || longitud === undefined) {
        return res.status(400).json({ error: 'Nombre, dirección, latitud y longitud son requeridos' });
      }

      const exists = await Branch.getById(req.params.id);
      if (!exists) {
        return res.status(404).json({ error: 'Sucursal no encontrada' });
      }

      await Branch.update(req.params.id, req.body);
      res.json({ message: 'Sucursal actualizada con éxito' });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la sucursal: ' + error.message });
    }
  },

  async delete(req, res) {
    try {
      const exists = await Branch.getById(req.params.id);
      if (!exists) {
        return res.status(404).json({ error: 'Sucursal no encontrada' });
      }

      await Branch.delete(req.params.id);
      res.json({ message: 'Sucursal eliminada (desactivada) con éxito' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar la sucursal: ' + error.message });
    }
  }
};

module.exports = branchController;
