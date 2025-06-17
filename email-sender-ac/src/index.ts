import { Hono } from 'hono';
import { Bindings } from './types';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', (c) => {
  return c.text('Servidor funcionando correctamente 🚀');
});

app.post('/send', async (c) => {
  const { DB, SENDGRID_API_KEY, SENDER_EMAIL, API_KEY } = c.env;

  // Seguridad: verificación con API Key
  const authHeader = c.req.header('Authorization');
  console.log('Header recibido:', authHeader);
  console.log('API_KEY esperada:', API_KEY);

  if (authHeader !== `Bearer ${API_KEY}`) {
    return c.json({ error: 'No autorizado' }, 401);
  }

  // Capturar el email del body
  const { email } = await c.req.json();
  if (!email) {
    return c.json({ error: 'Email requerido' }, 400);
  }

  // Guardar en la base de datos
  await DB.prepare('INSERT INTO email (email) VALUES (?)').bind(email).run();

  // Enviar correo con SendGrid
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email }] }],
      from: { email: SENDER_EMAIL },
      subject: 'Correo de prueba',
      content: [{ type: 'text/plain', value: '¡Hola! Este es un correo enviado desde Cloudflare Workers con Hono y SendGrid.' }],
    }),
  });

  if (!response.ok) {
    return c.json({ error: 'Error al enviar el correo' }, 500);
  }

  return c.json({ message: 'Correo enviado exitosamente' });
});

export default app;


app.get('/emails', async (c) => {
  const { DB, API_KEY } = c.env;

  // Seguridad: verificación con API Key
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${API_KEY}`) {
    return c.json({ error: 'No autorizado' }, 401);
  }

  // Consultar todos los correos
  const { results } = await DB.prepare('SELECT * FROM email ORDER BY sent_at DESC').all();

  return c.json(results);
});
