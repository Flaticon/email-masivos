// src/index.ts
import { Hono } from 'hono'

const app = new Hono()

// Ruta de prueba
app.get('/', (c) => {
  return c.text('Servidor funcionando correctamente 🚀')
})

// Ruta para enviar correos
app.post('/send-email', async (c) => {
  const { emails, subject, content } = await c.req.json()

  // Limitar a 150 correos
  if (!Array.isArray(emails) || emails.length === 0 || emails.length > 100) {
    return c.json({ error: 'Debe enviar entre 1 y 150 correos.' }, 400)
  }

  const apiKey = c.env.SENDGRID_API_KEY

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: emails.map(email => ({ email }))
        }
      ],
      from: { email: 'proyectos@acarquitectos.com' }, // Cambia si deseas otro remitente
      subject: subject,
      content: [{ type: 'text/plain', value: content }]
    })
  })

  if (response.ok) {
    return c.json({ message: 'Correos enviados exitosamente.' })
  } else {
    const error = await response.text()
    return c.json({ error: 'Error al enviar correos.', detalle: error }, 500)
  }
})

export default app
