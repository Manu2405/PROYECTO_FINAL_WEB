const Branch = require('../models/branch.model');
const { parseMapCoordinates } = require('../utils/mapParser');
const { uploadToCloudinary } = require('../middlewares/upload');

function resolveCoordinates(body) {
  const { latitud, longitud, link_mapa } = body;

  if (latitud !== undefined && longitud !== undefined) {
    return { latitud: parseFloat(latitud), longitud: parseFloat(longitud) };
  }

  if (link_mapa) {
    const coords = parseMapCoordinates(link_mapa);
    if (!coords) {
      throw new Error('No se pudieron extraer las coordenadas del enlace de mapa. Usa un enlace de Google Maps o Apple Maps con ubicación.');
    }
    return { latitud: coords.lat, longitud: coords.lng };
  }

  return null;
}

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
    const { nombre, direccion } = req.body;

    if (!nombre || !direccion) {
      return res.status(400).json({
        error: 'Nombre y dirección son requeridos'
      });
    }

    const coords = resolveCoordinates(req.body);

    if (!coords) {
      return res.status(400).json({
        error: 'Debes proporcionar un enlace de Google Maps o Apple Maps'
      });
    }

    let imagenes = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(
          file.buffer,
          'sucursales'
        );

        imagenes.push(url);
      }
    }

    const branchId = await Branch.create({
      ...req.body,
      ...coords,
      imagenes
    });

    res.status(201).json({
      message: 'Sucursal creada con éxito',
      id: branchId
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al crear la sucursal: ' + error.message
    });
  }
},

  async update(req, res) {
  try {
    const { nombre, direccion } = req.body;

    if (!nombre || !direccion) {
      return res.status(400).json({
        error: 'Nombre y dirección son requeridos'
      });
    }

    const exists = await Branch.getById(req.params.id);

    if (!exists) {
      return res.status(404).json({
        error: 'Sucursal no encontrada'
      });
    }

    let coords = resolveCoordinates(req.body);

    if (!coords) {
      coords = {
        latitud: exists.latitud,
        longitud: exists.longitud
      };
    }

    let imagenes = exists.imagenes || [];

    if (req.files && req.files.length > 0) {
      imagenes = [];

      for (const file of req.files) {
        const url = await uploadToCloudinary(
          file.buffer,
          'sucursales'
        );

        imagenes.push(url);
      }
    }

    await Branch.update(req.params.id, {
      ...req.body,
      ...coords,
      imagenes
    });

    res.json({
      message: 'Sucursal actualizada con éxito'
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al actualizar la sucursal: ' + error.message
    });
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
  },
};

module.exports = branchController;
