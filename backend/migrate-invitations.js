const db = require('./config/db');

const sql = `CREATE TABLE IF NOT EXISTS invitaciones_registro (
  id_invitacion INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(255) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  biografia TEXT,
  fecha_nacimiento DATE,
  rol ENUM('admin','artista','cliente') NOT NULL,
  id_sucursal INT NULL,
  creado_por INT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_sucursal) REFERENCES sucursales(id_sucursal) ON DELETE SET NULL,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
)`;

db.query(sql)
  .then(() => {
    console.log('Tabla invitaciones_registro lista.');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
