const mysql = require('mysql2/promise');
require('dotenv').config();

const sucursales = [
  {
    nombre: 'Sacred Ink - Portales',
    descripcion: 'Sucursal en zona Portales, Av. Andrés de Santa Cruz.',
    direccion: 'Av. General Andrés de Santa Cruz, Portales, Cochabamba, Bolivia',
    latitud: -17.3743168,
    longitud: -66.1568918,
    telefono: '+591 65393828',
    email: 'portales@sacredink.bo',
    imagen_url: 'https://images.unsplash.com/photo-1598252598333-c39994c16600?auto=format&fit=crop&q=80&w=800',
    horario_apertura: '09:30:00',
    horario_cierre: '20:30:00'
  },
  {
    nombre: 'Sacred Ink - Heroínas',
    descripcion: 'Sucursal central en Av. Heroínas esq. Baptista.',
    direccion: 'Av. Heroínas esq. Calle Baptista, Cochabamba, Bolivia',
    latitud: -17.3925593,
    longitud: -66.1576198,
    telefono: '+591 65635872',
    email: 'heroinas@sacredink.bo',
    imagen_url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800',
    horario_apertura: '09:30:00',
    horario_cierre: '20:30:00'
  },
  {
    nombre: 'Sacred Ink - Adela Zamudio',
    descripcion: 'Sucursal en Calle Adela Zamudio, zona Adela Zamudio.',
    direccion: 'Calle Adela Zamudio 1419, Cochabamba, Bolivia',
    latitud: -17.3748872,
    longitud: -66.1622516,
    telefono: '+591 73019790',
    email: 'adela@sacredink.bo',
    imagen_url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=800',
    horario_apertura: '10:00:00',
    horario_cierre: '20:00:00'
  }
];

async function updateSucursales() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'estudio_tatuajes'
  });

  try {
    await connection.query('DELETE FROM sucursales');
    await connection.query('ALTER TABLE sucursales AUTO_INCREMENT = 1');

    for (const s of sucursales) {
      await connection.query(
        `INSERT INTO sucursales (nombre, descripcion, direccion, latitud, longitud, telefono, email, imagen_url, horario_apertura, horario_cierre)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.nombre, s.descripcion, s.direccion, s.latitud, s.longitud, s.telefono, s.email, s.imagen_url, s.horario_apertura, s.horario_cierre]
      );
    }

    await connection.query("UPDATE usuarios SET id_sucursal = 1 WHERE email = 'admin@tattoostudio.com'");
    await connection.query("UPDATE usuarios SET id_sucursal = 2 WHERE email = 'marcos@tattoostudio.com'");
    await connection.query("UPDATE usuarios SET id_sucursal = 3 WHERE email = 'sofia@tattoostudio.com'");

    console.log('Sucursales actualizadas a Cochabamba (3 locales).');
    await connection.end();
  } catch (error) {
    console.error(error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

updateSucursales();
