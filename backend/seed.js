const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createDbSql = `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'estudio_tatuajes'}\`;`;

const tables = [
  `CREATE TABLE IF NOT EXISTS sucursales (
      id_sucursal INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      descripcion TEXT,
      direccion VARCHAR(255) NOT NULL,
      latitud DECIMAL(10,8) NOT NULL,
      longitud DECIMAL(11,8) NOT NULL,
      telefono VARCHAR(20),
      email VARCHAR(150),
      imagen_url VARCHAR(500),
      horario_apertura TIME,
      horario_cierre TIME,
      estado BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS usuarios (
      id_usuario INT AUTO_INCREMENT PRIMARY KEY,
      id_sucursal INT NULL,
      nombre VARCHAR(100) NOT NULL,
      apellido VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      telefono VARCHAR(20),
      foto_url VARCHAR(500),
      biografia TEXT,
      fecha_nacimiento DATE,
      rol ENUM('admin','artista','cliente') NOT NULL,
      estado BOOLEAN DEFAULT TRUE,
      fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
      ultimo_login DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (id_sucursal) REFERENCES sucursales(id_sucursal) ON DELETE SET NULL
  );`,

  `CREATE TABLE IF NOT EXISTS invitaciones_registro (
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
  );`,

  `CREATE TABLE IF NOT EXISTS especialidades (
      id_especialidad INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL UNIQUE,
      descripcion TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS usuario_especialidad (
      id_usuario_especialidad INT AUTO_INCREMENT PRIMARY KEY,
      id_usuario INT NOT NULL,
      id_especialidad INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(id_usuario, id_especialidad),
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
      FOREIGN KEY (id_especialidad) REFERENCES especialidades(id_especialidad) ON DELETE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS disenos (
      id_diseno INT AUTO_INCREMENT PRIMARY KEY,
      id_artista INT NOT NULL,
      titulo VARCHAR(150) NOT NULL,
      descripcion TEXT,
      imagen_url VARCHAR(500) NOT NULL,
      estilo VARCHAR(100),
      precio_referencia DECIMAL(10,2) DEFAULT 0,
      visible_portafolio BOOLEAN DEFAULT TRUE,
      likes INT DEFAULT 0,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (id_artista) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS reservas (
      id_reserva INT AUTO_INCREMENT PRIMARY KEY,
      id_cliente INT NOT NULL,
      id_artista INT NOT NULL,
      id_diseno INT NULL,
      fecha_reserva DATETIME NOT NULL,
      zona_cuerpo VARCHAR(100) NOT NULL,
      tamano ENUM('pequeno','mediano','grande','extra_grande') NOT NULL,
      descripcion TEXT,
      imagen_referencia_url VARCHAR(500),
      precio_estimado DECIMAL(10,2) DEFAULT 0,
      adelanto DECIMAL(10,2) DEFAULT 0,
      estado ENUM('pendiente','confirmada','cancelada','finalizada') DEFAULT 'pendiente',
      descuento_porcentaje INT DEFAULT 0,
      puntos_canjeados INT DEFAULT 0,
      observaciones TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (id_cliente) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
      FOREIGN KEY (id_artista) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
      FOREIGN KEY (id_diseno) REFERENCES disenos(id_diseno) ON DELETE SET NULL
  );`,

  `CREATE TABLE IF NOT EXISTS sesiones (
      id_sesion INT AUTO_INCREMENT PRIMARY KEY,
      id_reserva INT NOT NULL,
      numero_sesion INT NOT NULL,
      fecha_inicio DATETIME NOT NULL,
      fecha_fin DATETIME NOT NULL,
      duracion_horas DECIMAL(4,2),
      observaciones TEXT,
      estado ENUM('programada','realizada','cancelada') DEFAULT 'programada',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva) ON DELETE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS pagos (
      id_pago INT AUTO_INCREMENT PRIMARY KEY,
      id_reserva INT NOT NULL,
      monto DECIMAL(10,2) NOT NULL,
      metodo_pago ENUM('efectivo','qr','tarjeta','transferencia') NOT NULL,
      comprobante_url VARCHAR(500),
      referencia_transaccion VARCHAR(150),
      fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
      estado ENUM('pendiente','pagado','reembolsado') DEFAULT 'pagado',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva) ON DELETE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS resenas (
      id_resena INT AUTO_INCREMENT PRIMARY KEY,
      id_cliente INT NOT NULL,
      id_artista INT NOT NULL,
      id_reserva INT NOT NULL,
      puntuacion TINYINT NOT NULL,
      comentario TEXT,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      estado BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (id_cliente) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
      FOREIGN KEY (id_artista) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
      FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva) ON DELETE CASCADE,
      CHECK (puntuacion BETWEEN 1 AND 5)
  );`,

  `CREATE TABLE IF NOT EXISTS publicaciones_tatuajes (
      id_publicacion INT AUTO_INCREMENT PRIMARY KEY,
      id_cliente INT NOT NULL,
      id_artista INT NOT NULL,
      id_reserva INT NULL,
      imagen_url VARCHAR(500) NOT NULL,
      descripcion TEXT,
      fecha_tatuaje DATE NOT NULL,
      zona_cuerpo VARCHAR(100),
      votos_positivos INT DEFAULT 0,
      votos_negativos INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (id_cliente) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
      FOREIGN KEY (id_artista) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
      FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva) ON DELETE SET NULL
  );`,

  `CREATE TABLE IF NOT EXISTS votaciones_publicaciones (
      id_votacion INT AUTO_INCREMENT PRIMARY KEY,
      id_publicacion INT NOT NULL,
      id_usuario_voto INT NOT NULL,
      tipo_voto ENUM('positivo', 'negativo') NOT NULL,
      fecha_voto DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_voto (id_publicacion, id_usuario_voto),
      FOREIGN KEY (id_publicacion) REFERENCES publicaciones_tatuajes(id_publicacion) ON DELETE CASCADE,
      FOREIGN KEY (id_usuario_voto) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS comentarios_publicaciones (
      id_comentario INT AUTO_INCREMENT PRIMARY KEY,
      id_publicacion INT NOT NULL,
      id_usuario INT NOT NULL,
      contenido TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (id_publicacion) REFERENCES publicaciones_tatuajes(id_publicacion) ON DELETE CASCADE,
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS niveles_clientes (
      id_nivel INT AUTO_INCREMENT PRIMARY KEY,
      id_cliente INT NOT NULL UNIQUE,
      nivel_actual ENUM('Bronce', 'Plata', 'Oro', 'Diamante') DEFAULT 'Bronce',
      puntos_totales INT DEFAULT 0,
      descuento_pendiente INT DEFAULT 0,
      fecha_ultima_actividad DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (id_cliente) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS historial_puntos (
      id_historial INT AUTO_INCREMENT PRIMARY KEY,
      id_cliente INT NOT NULL,
      puntos INT NOT NULL,
      motivo VARCHAR(255) NOT NULL,
      referencia_id INT NULL,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_cliente) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
  );`
];

const truncateTables = [
  'historial_puntos',
  'niveles_clientes',
  'comentarios_publicaciones',
  'votaciones_publicaciones',
  'publicaciones_tatuajes',
  'resenas',
  'pagos',
  'sesiones',
  'reservas',
  'disenos',
  'usuario_especialidad',
  'invitaciones_registro',
  'usuarios',
  'especialidades',
  'sucursales',
];

const shouldReset = process.argv.includes('--reset');

async function seed() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = process.env.DB_PORT || 3306;
  const dbName = process.env.DB_NAME || 'estudio_tatuajes';

  console.log(`Conectando al servidor MySQL en ${host}:${port}...`);

  let connection;
  try {
    connection = await mysql.createConnection({ host, user, password, port });
  } catch (error) {
    console.error('Error conectando a MySQL.');
    console.error(error.message);
    process.exit(1);
  }

  try {
    console.log(`Creando base de datos \`${dbName}\` si no existe...`);
    await connection.query(createDbSql);
    await connection.query(`USE \`${dbName}\`;`);

    console.log('Creando tablas...');
    for (const tableQuery of tables) {
      await connection.query(tableQuery);
    }

    const alters = [
      'ALTER TABLE niveles_clientes ADD COLUMN descuento_pendiente INT DEFAULT 0',
      'ALTER TABLE reservas ADD COLUMN descuento_porcentaje INT DEFAULT 0',
      'ALTER TABLE reservas ADD COLUMN puntos_canjeados INT DEFAULT 0',
      'ALTER TABLE reservas ADD COLUMN duracion_horas DECIMAL(4,2) DEFAULT 1',
      'ALTER TABLE reservas ADD COLUMN numero_sesiones INT DEFAULT 1',
      'ALTER TABLE reservas ADD COLUMN modo_sesiones VARCHAR(30) DEFAULT \'unica\'',
      'ALTER TABLE reservas ADD COLUMN hora_fin DATETIME NULL',
      'ALTER TABLE usuarios ADD COLUMN horario_inicio TIME DEFAULT \'10:00:00\'',
      'ALTER TABLE usuarios ADD COLUMN horario_fin TIME DEFAULT \'18:00:00\'',
      'ALTER TABLE usuarios ADD COLUMN whatsapp VARCHAR(20) DEFAULT \'65242305\'',
      'ALTER TABLE invitaciones_registro ADD COLUMN horario_inicio TIME NULL',
      'ALTER TABLE invitaciones_registro ADD COLUMN horario_fin TIME NULL',
    ];
    for (const sql of alters) {
      try { await connection.query(sql); } catch (e) {}
    }

    if (shouldReset) {
      console.log('Modo --reset: eliminando todos los datos existentes...');
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      for (const table of truncateTables) {
        try {
          await connection.query(`TRUNCATE TABLE \`${table}\``);
        } catch (e) {
          try { await connection.query(`DELETE FROM \`${table}\``); } catch (_) {}
        }
      }
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    } else {
      console.log('Modo seguro: se conservan usuarios, publicaciones y demás datos existentes.');
      console.log('(Usa "npm run seed:reset" solo si quieres vaciar la base de datos por completo.)');
    }

    console.log('Verificando cuentas base...');
    const adminHash = await bcrypt.hash('Admin123!', 10);
    const artistaHash = await bcrypt.hash('Artista123!', 10);
    const clienteHash = await bcrypt.hash('cliente@gmail.com', 10);

    const baseAccounts = [
      { nombre: 'Admin', apellido: 'Sistema', email: 'admin@gmail.com', password_hash: adminHash, rol: 'admin' },
      { nombre: 'Artista', apellido: 'Demo', email: 'artista@gmail.com', password_hash: artistaHash, rol: 'artista' },
      { nombre: 'Cliente', apellido: 'Demo', email: 'cliente@gmail.com', password_hash: clienteHash, rol: 'cliente' },
    ];

    for (const account of baseAccounts) {
      const [existing] = await connection.query('SELECT id_usuario FROM usuarios WHERE email = ?', [account.email]);
      if (existing.length) {
        console.log(`  Ya existe: ${account.email}`);
        continue;
      }
      const [result] = await connection.query(
        'INSERT INTO usuarios (nombre, apellido, email, password_hash, rol) VALUES (?, ?, ?, ?, ?)',
        [account.nombre, account.apellido, account.email, account.password_hash, account.rol],
      );
      if (account.rol === 'cliente') {
        await connection.query(
          'INSERT INTO niveles_clientes (id_cliente, nivel_actual, puntos_totales) VALUES (?, \'Bronce\', 0)',
          [result.insertId],
        );
      }
      console.log(`  Creada: ${account.email}`);
    }

    const [userCount] = await connection.query('SELECT COUNT(*) as total FROM usuarios');
    const [pubCount] = await connection.query('SELECT COUNT(*) as total FROM publicaciones_tatuajes');

    console.log('Cuentas demo (si no existían):');
    console.log('  admin@gmail.com / Admin123! (admin)');
    console.log('  artista@gmail.com / Artista123! (artista)');
    console.log('  cliente@gmail.com / cliente@gmail.com (cliente)');
    console.log(`Base de datos lista. Usuarios: ${userCount[0].total}, Publicaciones: ${pubCount[0].total}.`);
    await connection.end();
  } catch (error) {
    console.error('Error durante el seed:');
    console.error(error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

seed();
