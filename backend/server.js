const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 5000;

// Configurar Middlewares Globales
app.use(cors()); // Permitir conexiones desde el frontend
app.use(express.json()); // Analizar cuerpos JSON
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Registrar solicitudes HTTP en la consola

// Cargar Archivos de Rutas
const branchRoutes = require('./routes/branch.routes');
const userRoutes = require('./routes/user.routes');
const specialtyRoutes = require('./routes/specialty.routes');
const designRoutes = require('./routes/design.routes');
const bookingRoutes = require('./routes/booking.routes');
const sessionRoutes = require('./routes/session.routes');
const paymentRoutes = require('./routes/payment.routes');
const reviewRoutes = require('./routes/review.routes');
const publicationRoutes = require('./routes/publication.routes');
const pointsRoutes = require('./routes/points.routes');

// Definir Endpoints de la API
app.use('/api/sucursales', branchRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/especialidades', specialtyRoutes);
app.use('/api/disenos', designRoutes);
app.use('/api/reservas', bookingRoutes);
app.use('/api/sesiones', sessionRoutes);
app.use('/api/pagos', paymentRoutes);
app.use('/api/resenas', reviewRoutes);
app.use('/api/publicaciones', publicationRoutes);
app.use('/api/fidelidad', pointsRoutes);

// Ruta Raíz de Prueba
app.get('/', (req, res) => {
  res.json({
    message: 'Servidor de API del Estudio de Tatuajes Corriendo Correctamente',
    version: '1.0.0',
    endpoints: [
      '/api/sucursales',
      '/api/usuarios',
      '/api/especialidades',
      '/api/disenos',
      '/api/reservas',
      '/api/sesiones',
      '/api/pagos',
      '/api/resenas',
      '/api/publicaciones',
      '/api/fidelidad'
    ]
  });
});

// Manejo de Error 404 (Ruta no encontrada)
app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador de Errores Global
app.use((err, req, res, next) => {
  console.error('Error no controlado en el servidor:');
  console.error(err.stack || err);
  res.status(500).json({ error: 'Error interno del servidor: ' + err.message });
});

// Iniciar el Servidor
const db = require('./config/db');

app.listen(PORT, async () => {
  console.log(`==================================================`);
  console.log(` Servidor activo en http://localhost:${PORT}`);
  console.log(` Modo de ejecución: ${process.env.NODE_ENV || 'desarrollo'}`);
  
  // Verificar la conexión a la base de datos MySQL
  try {
    await db.query('SELECT 1');
    console.log(` Conexión a Base de Datos: OK (Establecida con éxito)`);
  } catch (err) {
    console.error(` ERROR DE CONEXIÓN A BASE DE DATOS: Fallido`);
    console.error(` Detalle del error: ${err.message}`);
    console.error(` Por favor, verifica el archivo .env y que tu servidor MySQL esté activo.`);
  }
  console.log(`==================================================`);
});

