const db = require('./config/db');

const alters = [
  `ALTER TABLE usuarios ADD COLUMN horario_inicio TIME DEFAULT '10:00:00'`,
  `ALTER TABLE usuarios ADD COLUMN horario_fin TIME DEFAULT '18:00:00'`,
  `ALTER TABLE usuarios ADD COLUMN whatsapp VARCHAR(20) DEFAULT '65242305'`,
  `ALTER TABLE reservas ADD COLUMN hora_fin DATETIME NULL`,
  `ALTER TABLE reservas ADD COLUMN duracion_horas DECIMAL(4,2) DEFAULT 1`,
  `ALTER TABLE reservas ADD COLUMN numero_sesiones INT DEFAULT 1`,
  `ALTER TABLE reservas ADD COLUMN modo_sesiones VARCHAR(30) DEFAULT 'unica'`,
];

const creates = [
  `CREATE TABLE IF NOT EXISTS diseno_likes (
    id_diseno_like INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_diseno INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_usuario, id_diseno),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_diseno) REFERENCES disenos(id_diseno) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS sucursal_imagenes (
    id_imagen INT AUTO_INCREMENT PRIMARY KEY,
    id_sucursal INT NOT NULL,
    imagen_url VARCHAR(500) NOT NULL,
    orden INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_sucursal) REFERENCES sucursales(id_sucursal) ON DELETE CASCADE
  )`,
];

async function run() {
  for (const sql of alters) {
    try {
      await db.query(sql);
      console.log('OK:', sql.slice(0, 55));
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') console.log('SKIP:', sql.slice(0, 45));
      else console.error('Error:', err.message);
    }
  }
  for (const sql of creates) {
    await db.query(sql);
    console.log('OK:', sql.slice(0, 40));
  }
  await db.query(`UPDATE usuarios SET whatsapp = '65242305' WHERE whatsapp IS NULL OR whatsapp = ''`).catch(() => {});
  await db.query(`UPDATE usuarios SET horario_inicio = '10:00:00' WHERE horario_inicio IS NULL AND rol = 'artista'`).catch(() => {});
  await db.query(`UPDATE usuarios SET horario_fin = '18:00:00' WHERE horario_fin IS NULL AND rol = 'artista'`).catch(() => {});
  console.log('Migración v2 completada.');
  process.exit(0);
}

run();
