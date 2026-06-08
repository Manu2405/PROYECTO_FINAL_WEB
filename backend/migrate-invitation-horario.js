const db = require('./config/db');

async function run() {
  for (const sql of [
    `ALTER TABLE invitaciones_registro ADD COLUMN horario_inicio TIME NULL`,
    `ALTER TABLE invitaciones_registro ADD COLUMN horario_fin TIME NULL`,
  ]) {
    try {
      await db.query(sql);
      console.log('OK');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('SKIP');
      else console.error(e.message);
    }
  }
  process.exit(0);
}

run();
