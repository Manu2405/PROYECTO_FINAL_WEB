const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createDbSql = `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'estudio_tatuajes'}\`;`;

const tables = [
  // 1. SUCURSALES
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

  // 2. USUARIOS
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

  // 3. ESPECIALIDADES
  `CREATE TABLE IF NOT EXISTS especialidades (
      id_especialidad INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL UNIQUE,
      descripcion TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );`,

  // 4. USUARIO_ESPECIALIDAD
  `CREATE TABLE IF NOT EXISTS usuario_especialidad (
      id_usuario_especialidad INT AUTO_INCREMENT PRIMARY KEY,
      id_usuario INT NOT NULL,
      id_especialidad INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(id_usuario, id_especialidad),
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
      FOREIGN KEY (id_especialidad) REFERENCES especialidades(id_especialidad) ON DELETE CASCADE
  );`,

  // 5. DISENOS
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

  // 6. RESERVAS
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
      observaciones TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (id_cliente) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
      FOREIGN KEY (id_artista) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
      FOREIGN KEY (id_diseno) REFERENCES disenos(id_diseno) ON DELETE SET NULL
  );`,

  // 7. SESIONES
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

  // 8. PAGOS
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

  // 9. RESENAS
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

  // 10. PUBLICACIONES DE TATUAJES
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

  // 11. VOTACIONES EN PUBLICACIONES
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

  // 12. NIVELES_CLIENTES
  `CREATE TABLE IF NOT EXISTS niveles_clientes (
      id_nivel INT AUTO_INCREMENT PRIMARY KEY,
      id_cliente INT NOT NULL UNIQUE,
      nivel_actual ENUM('Bronce', 'Plata', 'Oro', 'Diamante') DEFAULT 'Bronce',
      puntos_totales INT DEFAULT 0,
      fecha_ultima_actividad DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (id_cliente) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
  );`,

  // 13. HISTORIAL DE PUNTOS
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

async function seed() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = process.env.DB_PORT || 3306;
  const dbName = process.env.DB_NAME || 'estudio_tatuajes';

  console.log(`Conectando al servidor MySQL en ${host}:${port}...`);
  
  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      user,
      password,
      port
    });
  } catch (error) {
    console.error('Error conectando a MySQL. Asegúrate de que el servidor esté activo y que el usuario/contraseña en .env sean correctos.');
    console.error(error.message);
    process.exit(1);
  }

  try {
    // 1. Crear base de datos
    console.log(`Creando base de datos \`${dbName}\` si no existe...`);
    await connection.query(createDbSql);
    await connection.query(`USE \`${dbName}\`;`);
    console.log('Base de datos seleccionada.');

    // 2. Crear tablas
    console.log('Creando tablas de la base de datos...');
    for (const tableQuery of tables) {
      await connection.query(tableQuery);
    }
    console.log('Todas las tablas creadas con éxito.');

    // 3. Limpiar base de datos si ya tiene información de prueba antigua para evitar duplicados
    console.log('Verificando si existen datos anteriores...');
    const [existingUsers] = await connection.query('SELECT id_usuario FROM usuarios LIMIT 1');
    if (existingUsers.length > 0) {
      console.log('La base de datos ya contiene registros. Saltando la inserción de datos semilla para proteger la información existente.');
      await connection.end();
      return;
    }

    console.log('Insertando datos iniciales (Semillas)...');

    // Seed Sucursales
    await connection.query(`
      INSERT INTO sucursales (nombre, descripcion, direccion, latitud, longitud, telefono, email, imagen_url, horario_apertura, horario_cierre)
      VALUES 
      ('Estudio Central - Centro Histórico', 'Nuestra sucursal principal con los mejores artistas de realismo y blackwork.', 'Av. de la Constitución 142, Centro', 19.432608, -99.133209, '55-1234-5678', 'central@tattoostudio.com', 'https://images.unsplash.com/photo-1598252598333-c39994c16600?auto=format&fit=crop&q=80&w=800', '10:00:00', '20:00:00'),
      ('Sucursal Norte - Lindavista', 'Un ambiente moderno enfocado en minimalismo y acuarela.', 'Av. Politécnico Nacional 890, Lindavista', 19.489110, -99.129480, '55-8765-4321', 'norte@tattoostudio.com', 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800', '11:00:00', '21:00:00')
    `);
    console.log('- Sucursales creadas.');

    // Seed Especialidades
    await connection.query(`
      INSERT INTO especialidades (nombre, descripcion)
      VALUES 
      ('Realismo', 'Tatuajes detallados que asemejan fotografías en blanco y negro o color.'),
      ('Blackwork', 'Uso intensivo de tinta negra para crear patrones, siluetas y texturas.'),
      ('Fine Line', 'Tatuajes con líneas ultra finas, elegantes, delicadas y minimalistas.'),
      ('Tradicional', 'El estilo clásico americano: líneas gruesas, sombras simples y colores primarios.'),
      ('Acuarela', 'Estilo artístico simulando pintura con pinceladas suaves y degradados vibrantes.')
    `);
    console.log('- Especialidades creadas.');

    // Seed Usuarios (contraseñas por defecto: '123456')
    const passHash = await bcrypt.hash('123456', 10);
    
    // 1 Admin, 2 Artistas, 1 Cliente
    await connection.query(`
      INSERT INTO usuarios (id_sucursal, nombre, apellido, email, password_hash, telefono, foto_url, biografia, fecha_nacimiento, rol)
      VALUES 
      (1, 'Carlos', 'Administrador', 'admin@tattoostudio.com', ?, '55-9999-8888', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300', 'Gerente general del estudio de tatuajes.', '1985-06-15', 'admin'),
      (1, 'Marcos', 'Ink', 'marcos@tattoostudio.com', ?, '55-7777-6666', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300', 'Especialista en Realismo y Blackwork con más de 10 años de trayectoria.', '1990-03-22', 'artista'),
      (2, 'Sofía', 'Line', 'sofia@tattoostudio.com', ?, '55-5555-4444', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300', 'Artista apasionada del Fine Line, puntillismo y geometría sagrada.', '1995-11-05', 'artista'),
      (NULL, 'Juan', 'Pérez', 'cliente@gmail.com', ?, '55-2222-3333', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300', 'Fanático del arte corporal y coleccionista de tatuajes.', '2000-09-18', 'cliente')
    `, [passHash, passHash, passHash, passHash]);
    console.log('- Usuarios de prueba creados (password para todos: "123456").');

    // Get inserted artist IDs
    const [artists] = await connection.query("SELECT id_usuario, nombre FROM usuarios WHERE rol = 'artista'");
    const marcosId = artists.find(a => a.nombre === 'Marcos').id_usuario;
    const sofiaId = artists.find(a => a.nombre === 'Sofía').id_usuario;

    // Get inserted client ID
    const [clients] = await connection.query("SELECT id_usuario FROM usuarios WHERE rol = 'cliente'");
    const clienteId = clients[0].id_usuario;

    // Seed specialties association (usuario_especialidad)
    // Marcos: Realismo (1), Blackwork (2)
    // Sofia: Fine Line (3), Acuarela (5)
    await connection.query(`
      INSERT INTO usuario_especialidad (id_usuario, id_especialidad)
      VALUES 
      (?, 1),
      (?, 2),
      (?, 3),
      (?, 5)
    `, [marcosId, marcosId, sofiaId, sofiaId]);
    console.log('- Asociación de especialidades completada.');

    // Seed Diseños
    await connection.query(`
      INSERT INTO disenos (id_artista, titulo, descripcion, imagen_url, estilo, precio_referencia, visible_portafolio, likes)
      VALUES 
      (?, 'León Realista', 'Diseño de cabeza de león con detalles geométricos de fondo en sombreado realista.', 'https://images.unsplash.com/photo-1550537687-c91072c4792d?auto=format&fit=crop&q=80&w=600', 'Realismo', 1200.00, TRUE, 42),
      (?, 'Calavera Sombría', 'Calavera anatómica completa en estilo blackwork con tramas de puntos.', 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=600', 'Blackwork', 950.00, TRUE, 27),
      (?, 'Flor de Loto Minimalista', 'Flor de loto fina ideal para muñeca o clavícula, hecha con líneas puras.', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600', 'Fine Line', 450.00, TRUE, 89),
      (?, 'Galaxia Acuarela', 'Efecto de nebulosa espacial en acuarela pura sin líneas de contorno.', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=600', 'Acuarela', 800.00, TRUE, 56)
    `, [marcosId, marcosId, sofiaId, sofiaId]);
    console.log('- Diseños semilla creados.');

    // Seed Niveles Cliente (loyalty programs)
    await connection.query(`
      INSERT INTO niveles_clientes (id_cliente, nivel_actual, puntos_totales)
      VALUES (?, 'Bronce', 0)
    `, [clienteId]);
    console.log('- Niveles de fidelización inicializados para clientes.');

    console.log('¡Base de datos y datos de prueba sembrados exitosamente!');
    await connection.end();
  } catch (error) {
    console.error('Error durante la inserción de datos semilla:');
    console.error(error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

seed();
