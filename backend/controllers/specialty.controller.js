const Specialty = require('../models/specialty.model');

const specialtyController = {
  async getAll(req, res) {
    try {
      const specialties = await Specialty.getAll();
      res.json(specialties);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las especialidades: ' + error.message });
    }
  },

  async getById(req, res) {
    try {
      const specialty = await Specialty.getById(req.params.id);
      if (!specialty) {
        return res.status(404).json({ error: 'Especialidad no encontrada' });
      }
      res.json(specialty);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener la especialidad: ' + error.message });
    }
  },

  async create(req, res) {
    try {
      const { nombre, descripcion } = req.body;
      if (!nombre) {
        return res.status(400).json({ error: 'El nombre de la especialidad es obligatorio' });
      }

      const id = await Specialty.create({ nombre, descripcion });
      res.status(201).json({ message: 'Especialidad creada con éxito', id });
    } catch (error) {
      res.status(500).json({ error: 'Error al crear la especialidad: ' + error.message });
    }
  },

  async update(req, res) {
    try {
      const { nombre, descripcion } = req.body;
      if (!nombre) {
        return res.status(400).json({ error: 'El nombre de la especialidad es obligatorio' });
      }

      const exists = await Specialty.getById(req.params.id);
      if (!exists) {
        return res.status(404).json({ error: 'Especialidad no encontrada' });
      }

      await Specialty.update(req.params.id, { nombre, descripcion });
      res.json({ message: 'Especialidad actualizada con éxito' });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la especialidad: ' + error.message });
    }
  },

  async delete(req, res) {
    try {
      const exists = await Specialty.getById(req.params.id);
      if (!exists) {
        return res.status(404).json({ error: 'Especialidad no encontrada' });
      }

      await Specialty.delete(req.params.id);
      res.json({ message: 'Especialidad eliminada con éxito' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar la especialidad: ' + error.message });
    }
  },

  async getArtistSpecialties(req, res) {
    try {
      const artistId = req.params.artistId;
      const specialties = await Specialty.getArtistSpecialties(artistId);
      res.json(specialties);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener especialidades del artista: ' + error.message });
    }
  },

  async updateArtistSpecialties(req, res) {
    try {
      const artistId = req.user.rol === 'artista' ? req.user.id_usuario : req.body.id_usuario;
      const { especialidadesIds } = req.body; // Array de IDs de especialidades

      if (!artistId) {
        return res.status(400).json({ error: 'ID de artista no provisto o no válido' });
      }

      if (!Array.isArray(especialidadesIds)) {
        return res.status(400).json({ error: 'especialidadesIds debe ser un arreglo de números' });
      }

      await Specialty.setArtistSpecialties(artistId, especialidadesIds);
      res.json({ message: 'Especialidades del artista actualizadas con éxito' });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar especialidades del artista: ' + error.message });
    }
  }
};

module.exports = specialtyController;
