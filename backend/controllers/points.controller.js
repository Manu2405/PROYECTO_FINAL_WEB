const Points = require('../models/points.model');
const User = require('../models/user.model');

const pointsController = {
  async getMyLevel(req, res) {
    try {
      if (req.user.rol !== 'cliente') {
        return res.status(403).json({ error: 'Solo los clientes participan en el programa de fidelidad' });
      }

      const clientId = req.user.id_usuario;
      const status = await Points.getClientLevel(clientId);

      if (!status) {
        await Points.initializeClient(clientId);
        const newStatus = await Points.getClientLevel(clientId);
        return res.json(newStatus);
      }

      res.json(status);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener nivel de puntos: ' + error.message });
    }
  },

  async getMyHistory(req, res) {
    try {
      if (req.user.rol !== 'cliente') {
        return res.status(403).json({ error: 'Solo los clientes participan en el programa de fidelidad' });
      }

      const clientId = req.user.id_usuario;
      const history = await Points.getPointsHistory(clientId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener historial de puntos: ' + error.message });
    }
  },

  async searchClientsAdmin(req, res) {
    try {
      const { q } = req.query;
      if (!q || q.trim().length < 2) {
        return res.json([]);
      }

      const clients = await User.searchClients(q.trim());
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: 'Error al buscar clientes: ' + error.message });
    }
  },

  async getClientLevelAdmin(req, res) {
    try {
      const clientId = req.params.clientId;
      const client = await User.findById(clientId);

      if (!client) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      if (client.rol !== 'cliente') {
        return res.status(400).json({ error: 'Solo los clientes tienen programa de fidelidad' });
      }

      const status = await Points.getClientLevel(clientId);
      res.json({
        cliente: {
          id_usuario: client.id_usuario,
          nombre: client.nombre,
          apellido: client.apellido,
        },
        fidelidad: status || { nivel_actual: 'Bronce', puntos_totales: 0 },
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al consultar nivel de fidelidad: ' + error.message });
    }
  },

  async redeemDiscount(req, res) {
    try {
      if (req.user.rol !== 'cliente') {
        return res.status(403).json({ error: 'Solo los clientes pueden canjear puntos' });
      }

      const { bloques } = req.body;
      const result = await Points.redeemDiscount(req.user.id_usuario, bloques);

      res.json({
        message: `Descuento del ${result.descuento_pendiente}% listo para tu proxima reserva`,
        ...result,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};

module.exports = pointsController;
