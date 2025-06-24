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
  const { DB, SENDGRID_API_KEY, SENDER_EMAIL } = c.env;

  // Manejo seguro del cuerpo de la solicitud
  let body;
  try {
    body = await c.req.json();
  } catch (err) {
    return c.json({ error: 'El cuerpo de la solicitud no es un JSON válido.' }, 400);
  }

  const { emails, subject, content } = body;

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return c.json({ error: 'Debe proporcionar al menos un email' }, 400);
  }

  if (emails.length > 150) {
    return c.json({ error: 'No se pueden enviar más de 150 correos a la vez' }, 400);
  }

  if (!subject || !content) {
    return c.json({ error: 'El subject y el content son requeridos' }, 400);
  }

  if (!emails.every(email => emailRegex.test(email))) {
    return c.json({ error: 'Uno o más correos no tienen un formato válido' }, 400);
  }

  // Guardar cada email en la base de datos
  for (const email of emails) {
    await DB.prepare('INSERT INTO email_logs (email, subject, content, status, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)')
      .bind(email, subject, content, 'pending')
      .run();
  }

  // Intentar enviar los correos
  let response;
  try {
    response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: emails.map(email => ({ email })) }],
        from: { email: SENDER_EMAIL },
        subject: subject,
        content: [{ type: 'text/plain', value: content }],
      }),
    });
  } catch (err) {
    // Si hay error de conexión con SendGrid
    for (const email of emails) {
      await DB.prepare('UPDATE email_logs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?')
        .bind('error', email)
        .run();
    }
    return c.json({ error: 'Error de conexión con SendGrid', detalle: err.message }, 500);
  }

  let detail;
  try {
    detail = await response.json();
  } catch {
    detail = await response.text();
  }

  if (!response.ok) {
    // Actualizar estado a 'error'
    for (const email of emails) {
      await DB.prepare('UPDATE email_logs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?')
        .bind('error', email)
        .run();
    }
    return c.json({ error: 'Error al enviar el correo', detalle: detail }, 500);
  }

  // Actualizar estado a 'sent'
  for (const email of emails) {
    await DB.prepare('UPDATE email_logs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ? AND subject = ?')
      .bind('sent', email, subject)
      .run();
  }

  return c.json({
    message: 'Correos enviados exitosamente',
    detalle: detail,
    enviados: emails
  });
});

app.get('/emails', authMiddleware, async (c) => {
  const { DB } = c.env;

  const { results } = await DB.prepare('SELECT * FROM email_logs ORDER BY created_at DESC').all();

  return c.json(results);
});

export default app;
