import { Hono } from 'hono';
import { Bindings } from './types';

const app = new Hono<{ Bindings: Bindings }>();

// Middleware para autenticación
const authMiddleware = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${c.env.API_KEY}`) {
    return c.json({ error: 'No autorizado' }, 401);
  }
  await next();
};

// Validación de formato de email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.get('/', (c) => {
  return c.text('Servidor funcionando correctamente 🚀');
});

app.post('/send', authMiddleware, async (c) => {
  const { DB, SENGRID_API_KEY, SENDER_EMAIL } = c.env;

  // Capturar emails desde el body (ahora se aceptan múltiples)
  const { emails } = await c.req.json();

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return c.json({ error: 'Debe proporcionar al menos un email' }, 400);
  }

  if (emails.length > 150) {
    return c.json({ error: 'No se pueden enviar más de 150 correos a la vez' }, 400);
  }

  // Validar formato de emails
  if (!emails.every(email => emailRegex.test(email))) {
    return c.json({ error: 'Uno o más correos no tienen un formato válido' }, 400);
  }

  // Guardar cada email en la base de datos
  for (const email of emails) {
    await DB.prepare('INSERT INTO email (email) VALUES (?)').bind(email).run();
  }

  // Enviar correo con SendGrid
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SENGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        { to: emails.map(email => ({ email })) }
      ],
      from: { email: SENDER_EMAIL },
      subject: 'Correo de prueba',
      content: [{ type: 'text/plain', value: '¡Hola! Este es un correo enviado desde Cloudflare Workers con Hono y SendGrid.' }],
    }),
  });

  if (!response.ok) {
    const errorDetail = await response.text();
    return c.json({ error: 'Error al enviar el correo', detalle: errorDetail }, 500);
  }

  return c.json({ message: 'Correos enviados exitosamente' });
});

app.get('/emails', authMiddleware, async (c) => {
  const { DB } = c.env;

  // Consultar todos los correos
  const { results } = await DB.prepare('SELECT * FROM email ORDER BY sent_at DESC').all();

  return c.json(results);
});

export default app;
