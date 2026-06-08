const Design = require('../models/design.model');
const { uploadToCloudinary } = require('../middlewares/upload');

const designController = {
  async getAll(req, res) {
    try {
      const { estilo, id_artista, sort } = req.query;
      let visibleOnly = true;
      if (req.user && (req.user.rol === 'admin' || req.user.rol === 'artista')) {
        visibleOnly = false;
      }

      const designs = await Design.getAll({ estilo, id_artista, visibleOnly, sort });
      let likedIds = [];
      if (req.user?.id_usuario) {
        likedIds = await Design.getLikedByUser(req.user.id_usuario, designs.map((d) => d.id_diseno));
      }

      const withLikes = designs.map((d) => ({
        ...d,
        liked_by_user: likedIds.includes(d.id_diseno),
      }));

      res.json(withLikes);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los diseños: ' + error.message });
    }
  },

  async getById(req, res) {
    try {
      const design = await Design.getById(req.params.id);
      if (!design) return res.status(404).json({ error: 'Diseño no encontrado' });
      res.json(design);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el diseño: ' + error.message });
    }
  },

  async create(req, res) {
    try {
      const { titulo, descripcion, estilo, visible_portafolio } = req.body;
      const id_artista = req.user.id_usuario;

      if (!titulo) return res.status(400).json({ error: 'El título es obligatorio' });
      if (!req.file) return res.status(400).json({ error: 'Debe subir una imagen del diseño' });

      const imagen_url = await uploadToCloudinary(req.file.buffer, 'portafolio_disenos');

      const id = await Design.create({
        id_artista, titulo, descripcion, imagen_url, estilo,
        precio_referencia: 0,
        visible_portafolio: visible_portafolio === 'false' ? false : true,
      });

      res.status(201).json({ message: 'Diseño añadido al portafolio', id, imagen_url });
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el diseño: ' + error.message });
    }
  },

  async update(req, res) {
    try {
      const { titulo, descripcion, estilo, visible_portafolio } = req.body;
      const designId = req.params.id;
      const design = await Design.getById(designId);

      if (!design) return res.status(404).json({ error: 'Diseño no encontrado' });
      if (req.user.rol !== 'admin' && design.id_artista !== req.user.id_usuario) {
        return res.status(403).json({ error: 'No tienes permiso para modificar este diseño' });
      }

      let imagen_url = null;
      if (req.file) imagen_url = await uploadToCloudinary(req.file.buffer, 'portafolio_disenos');

      await Design.update(designId, {
        titulo: titulo || design.titulo,
        descripcion: descripcion !== undefined ? descripcion : design.descripcion,
        imagen_url,
        estilo: estilo !== undefined ? estilo : design.estilo,
        precio_referencia: 0,
        visible_portafolio: visible_portafolio !== undefined
          ? (visible_portafolio === 'false' || visible_portafolio === false ? false : true)
          : design.visible_portafolio,
      });

      res.json({ message: 'Diseño actualizado', imagen_url });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el diseño: ' + error.message });
    }
  },

  async delete(req, res) {
    try {
      const design = await Design.getById(req.params.id);
      if (!design) return res.status(404).json({ error: 'Diseño no encontrado' });
      if (req.user.rol !== 'admin' && design.id_artista !== req.user.id_usuario) {
        return res.status(403).json({ error: 'No tienes permiso para eliminar este diseño' });
      }
      await Design.delete(req.params.id);
      res.json({ message: 'Diseño eliminado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el diseño: ' + error.message });
    }
  },

  async toggleLike(req, res) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Debes iniciar sesión' });
      if (req.user.rol !== 'cliente') {
        return res.status(403).json({ error: 'Solo los clientes pueden dar like' });
      }

      const design = await Design.getById(req.params.id);
      if (!design) return res.status(404).json({ error: 'Diseño no encontrado' });

      const result = await Design.toggleLike(req.params.id, req.user.id_usuario);
      const likes = await Design.getLikeCount(req.params.id);

      res.json({ ...result, likes });
    } catch (error) {
      res.status(500).json({ error: 'Error al procesar like: ' + error.message });
    }
  },
};

module.exports = designController;
