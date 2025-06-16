# EMAIL SENDER: Hono + Astro + Sendgrid + Cloudflare D1

##Descripción
Este proyecto permite enviar correos masivos a través de un formulario web creado con Astro, gestionado por una API
rápida usando el framework backend Hono sobre Cloudflare Workers. Los correos se envían usando SenGrid y los registros de envío se almacenan en Cloudflare D1.

## Índice / Table of Contents

- Descripción / Description  
- Tecnologías Utilizadas / Technologies Used  
- Estructura del Proyecto / Project Structure  
- Instalación / Installation  
- Uso de la API / API Usage  
- Base de Datos / Database  
- Conexión con Astro / Astro Connection  
- Buenas Prácticas / Best Practices  
- Despliegue / Deployment  
- Contacto / Contact  
- Mejoras Futuras / Future Improvements  
- Licencia / License  

---

## Descripción / Description

Este proyecto permite enviar correos masivos a través de un formulario web creado con Astro, gestionado por una API rápida desarrollada con Hono sobre Cloudflare Workers. Los correos se envían utilizando SendGrid y los registros de envío se almacenan en Cloudflare D1.

This project allows mass email sending through a web form created with Astro, managed by a fast API developed with Hono on Cloudflare Workers. Emails are sent using SendGrid and the sending logs are stored in Cloudflare D1.

---

## Tecnologías Utilizadas / Technologies Used

| Tecnología / Technology | Descripción / Description                                     | Uso en el proyecto / Project Usage                |
|--------------------------|--------------------------------------------------------------|--------------------------------------------------|
| Hono                     | Framework minimalista para crear APIs rápidas.              | Gestiona las rutas y lógica de la API.           |
| Astro                    | Framework para crear sitios web rápidos.                    | Crea la interfaz web con el formulario.          |
| SendGrid                 | Servicio para envío de correos masivos.                     | Envía los correos a través de la API.            |
| Cloudflare Workers       | Plataforma serverless para ejecutar código en el borde.     | Ejecuta la API de forma escalable.               |
| Cloudflare D1            | Base de datos SQL ligera (SQLite).                          | Registra los correos enviados.                   |
| Wrangler                 | CLI para Cloudflare Workers.                                | Desarrolla, gestiona y despliega el proyecto.    |
| pnpm                     | Gestor de paquetes rápido y eficiente.                      | Gestiona las dependencias del proyecto.          |

---


