const Design = require('../models/design.model');
const { uploadToCloudinary } = require('../middlewares/upload');

const designController = {
  async getAll(req, res) {
    try {
      const { estilo, id_artista } = req.query;
      // Los administradores y los propios artistas pueden querer ver todos los diseños, incluyendo los invisibles.
      // Si no es admin/artista, o no está autenticado, solo mostrar visibleOnly = true.
      let visibleOnly = true;

      // Si hay cabecera de autenticación y el rol es admin o artista, podemos mostrar invisibles
      if (req.user && (req.user.rol === 'admin' || req.user.rol === 'artista')) {
        visibleOnly = false;
      }

      const designs = await Design.getAll({ estilo, id_artista, visibleOnly });
      res.json(designs);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los diseños: ' + error.message });
    }
  },

  async getById(req, res) {
    try {
      const design = await Design.getById(req.params.id);
      if (!design) {
        return res.status(404).json({ error: 'Diseño no encontrado' });
      }
      res.json(design);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el diseño: ' + error.message });
    }
  },

  async create(req, res) {
    try {
      const { titulo, descripcion, estilo, precio_referencia, visible_portafolio } = req.body;
      const id_artista = req.user.id_usuario; // Asignar al artista logueado

      if (!titulo) {
        return res.status(400).json({ error: 'El título del diseño es obligatorio' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Debe subir una imagen del diseño' });
      }

      // Subir imagen a Cloudinary
      const imagen_url = await uploadToCloudinary(req.file.buffer, 'portafolio_disenos');

      const id = await Design.create({
        id_artista,
        titulo,
        descripcion,
        imagen_url,
        estilo,
        precio_referencia: precio_referencia ? parseFloat(precio_referencia) : 0,
        visible_portafolio: visible_portafolio === 'false' ? false : true
      });

      res.status(201).json({ message: 'Diseño creado y añadido al portafolio', id, imagen_url });
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el diseño: ' + error.message });
    }
  },

  async update(req, res) {
    try {
      const { titulo, descripcion, estilo, precio_referencia, visible_portafolio } = req.body;
      const designId = req.params.id;

      const design = await Design.getById(designId);
      if (!design) {
        return res.status(404).json({ error: 'Diseño no encontrado' });
      }

      // Verificar que el artista sea dueño de este diseño, o que sea un admin
      if (req.user.rol !== 'admin' && design.id_artista !== req.user.id_usuario) {
        return res.status(403).json({ error: 'No tienes permiso para modificar este diseño' });
      }

      let imagen_url = null;
      if (req.file) {
        imagen_url = await uploadToCloudinary(req.file.buffer, 'portafolio_disenos');
      }

      await Design.update(designId, {
        titulo: titulo || design.titulo,
        descripcion: descripcion !== undefined ? descripcion : design.descripcion,
        imagen_url,
        estilo: estilo !== undefined ? estilo : design.estilo,
        precio_referencia: precio_referencia !== undefined ? parseFloat(precio_referencia) : design.precio_referencia,
        visible_portafolio: visible_portafolio !== undefined ? (visible_portafolio === 'false' || visible_portafolio === false ? false : true) : design.visible_portafolio
      });

      res.json({ message: 'Diseño actualizado con éxito', imagen_url });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el diseño: ' + error.message });
    }
  },

  async delete(req, res) {
    try {
      const designId = req.params.id;
      const design = await Design.getById(designId);

      if (!design) {
        return res.status(404).json({ error: 'Diseño no encontrado' });
      }

      // Verificar permisos
      if (req.user.rol !== 'admin' && design.id_artista !== req.user.id_usuario) {
        return res.status(403).json({ error: 'No tienes permiso para eliminar este diseño' });
      }

      await Design.delete(designId);
      res.json({ message: 'Diseño eliminado con éxito' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el diseño: ' + error.message });
    }
  },

  async like(req, res) {
    try {
      const designId = req.params.id;
      const design = await Design.getById(designId);

      if (!design) {
        return res.status(404).json({ error: 'Diseño no encontrado' });
      }

      await Design.likeDesign(designId);
      res.json({ message: 'Like registrado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al dar like al diseño: ' + error.message });
    }
  }
};

module.exports = designController;
