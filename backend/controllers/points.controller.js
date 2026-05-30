const Points = require('../models/points.model');
const User = require('../models/user.model');

const pointsController = {
  async getMyLevel(req, res) {
    try {
      const clientId = req.user.id_usuario;
      const status = await Points.getClientLevel(clientId);
      
      if (!status) {
        // Inicializar si no tiene registro
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
      const clientId = req.user.id_usuario;
      const history = await Points.getPointsHistory(clientId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener historial de puntos: ' + error.message });
    }
  },

  async getClientLevelAdmin(req, res) {
    try {
      const clientId = req.params.clientId;
      const client = await User.findById(clientId);
      
      if (!client) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      const status = await Points.getClientLevel(clientId);
      res.json({
        cliente: {
          id_usuario: client.id_usuario,
          nombre: client.nombre,
          apellido: client.apellido,
          email: client.email
        },
        fidelidad: status || { nivel_actual: 'Bronce', puntos_totales: 0 }
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al consultar nivel de fidelidad: ' + error.message });
    }
  },

  async addPointsAdmin(req, res) {
    try {
      const { id_cliente, puntos, motivo } = req.body;

      if (!id_cliente || puntos === undefined || !motivo) {
        return res.status(400).json({ error: 'ID de cliente, puntos (positivo o negativo) y motivo son obligatorios' });
      }

      const client = await User.findById(id_cliente);
      if (!client) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      const updatedLevel = await Points.addPoints(
        parseInt(id_cliente),
        parseInt(puntos),
        `Ajuste Administrativo: ${motivo}`,
        req.user.id_usuario // ID del admin que realiza el cambio como referencia
      );

      res.json({
        message: `Se ajustaron ${puntos} puntos con éxito.`,
        fidelidad: updatedLevel
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al ajustar puntos administrativamente: ' + error.message });
    }
  }
};

module.exports = pointsController;
