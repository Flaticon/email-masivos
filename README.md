# EMAIL SENDER: Hono + Astro + Sendgrid + Cloudflare D1


## Descripción / Description

Este proyecto permite enviar correos masivos a través de un formulario web creado con Astro, gestionado por una API rápida desarrollada con Hono sobre Cloudflare Workers. Los correos se envían utilizando SendGrid y los registros de envío se almacenan en Cloudflare D1.

This project allows mass email sending through a web form created with Astro, managed by a fast API developed with Hono on Cloudflare Workers. Emails are sent using SendGrid and the sending logs are stored in Cloudflare D1.

- **Frontend**: Formulario web con Astro  
- **Backend**: API rápida con Hono + Cloudflare Workers  
- **Email**: Envío mediante SendGrid  
- **Database**: Registro en Cloudflare D1 (SQLite)  

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
## Estructura del Proyecto / Project Structure
```bash
email-sender/
├── worker/ # Cloudflare Worker
│ ├── src/
│ │ ├── index.ts # Lógica principal
│ │ └── email/ # Módulos de SendGrid
│ ├── wrangler.toml # Config Cloudflare
│ └── package.json # Dependencias (PNPM)
├── astro-frontend/ # Interfaz web
│ ├── src/
│ │ ├── pages/ # Páginas Astro
│ │ └── components/ # Componentes UI
│ └── package.json
└── README.md # Este archivo
```

## 🛠 Configuración Inicial (PNPM)


# 1. Clonar repositorio 
git clone https://github.com/Flaticon/email-sender.git
cd email-sender

# 2. Iniciar Worker
cd worker
pnpm init
pnpm add hono @cloudflare/workers-types wrangler -D

# 3. Iniciar Astro
cd ../astro-frontend
pnpm create astro@latest

# 4. Configurar SendGrid (OBLIGATORIO)
cd ../worker
pnpm dlx wrangler secret put SENDGRID_API_KEY(Lo obtienes de Sengrid)



##Despliegue en Producción
# 1. Configurar secrets para producción
cd worker
pnpm dlx wrangler secret put SENDGRID_API_KEY --env production

# 2. Crear base de datos
pnpm dlx wrangler d1 create email-db

# 3. Desplegar
pnpm dlx wrangler deploy --env production

# 4. Desplegar frontend
cd ../astro-frontend
pnpm build
pnpm deploy

##📊 Monitoreo

# Ver logs en tiempo real
pnpm dlx wrangler tail --env production

# Ver estadísticas de SendGrid
curl -X "GET" "https://api.sendgrid.com/v3/stats" \
  -H "Authorization: Bearer $SENDGRID_API_KEY"


