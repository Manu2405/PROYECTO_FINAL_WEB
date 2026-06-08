const nodemailer = require('nodemailer');
require('dotenv').config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

function smtpConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransporter() {
  if (!smtpConfigured()) {
    throw new Error('SMTP no configurado. Define SMTP_USER y SMTP_PASS en el archivo .env');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER.trim(),
      pass: process.env.SMTP_PASS.replace(/\s/g, ''),
    },
  });
}

function formatSmtpError(err) {
  const msg = err?.message || '';
  if (msg.includes('535') || msg.includes('BadCredentials')) {
    return 'No se pudo autenticar con Gmail. Genera una contraseña de aplicación nueva en tu cuenta de Google (Seguridad > Verificación en 2 pasos > Contraseñas de aplicaciones) y actualiza SMTP_PASS en .env';
  }
  return `Error al enviar el correo: ${msg}`;
}

async function sendConfirmationEmail(email, token, nombre) {
  const confirmUrl = `${FRONTEND_URL}/confirmar-cuenta?token=${token}`;
  const subject = 'Confirma tu cuenta - InkHouse';
  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
      <h2 style="color: #8B0000;">Hola ${nombre},</h2>
      <p>Recibimos una solicitud para crear tu cuenta en InkHouse.</p>
      <p>Haz clic en el siguiente enlace para confirmar y activar tu cuenta:</p>
      <p><a href="${confirmUrl}" style="color: #D4AF37; font-weight: bold;">Confirmar mi cuenta</a></p>
      <p style="color: #666; font-size: 13px;">Este enlace expira en 48 horas. Si no solicitaste esta cuenta, ignora este correo.</p>
    </div>
  `;

  const transporter = createTransporter();
  const from = (process.env.SMTP_FROM || process.env.SMTP_USER).replace(/^["']|["']$/g, '');

  try {
    await transporter.sendMail({ from, to: email, subject, html });
  } catch (err) {
    console.error('Error SMTP:', err.message);
    throw new Error(formatSmtpError(err));
  }
}

module.exports = { sendConfirmationEmail, smtpConfigured };
