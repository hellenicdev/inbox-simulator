# Executive Inbox Simulator

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/S6S31XB030)

A Gmail-style inbox that fills up with realistic, AI-generated emails from high-profile archetypes in business, tech, media, sports and entertainment. Ever wondered what a CEO's inbox looks like? Now you can live in it.

**Live:** https://hellenicdev.eu/inbox-simulator/

## Features

- Familiar three-pane inbox: sidebar, email list and preview panel
- On-demand AI email generation from a roster of sender archetypes
- Inbox, Archive and Spam folders, read/unread state and categories
- Full-text search across subject, body and sender
- Accounts with JWT auth and Cloudflare Turnstile protection
- Rate limiting on the whole API, sign-in and AI generation
- Loading skeletons, toasts, error boundary and responsive layout

## Tech stack

| Layer | Tech |
| --- | --- |
| Frontend | React, Vite (GitHub Pages via GitHub Actions) |
| Backend | Node.js, Express, JWT, bcrypt, express-rate-limit |
| AI | Groq API |
| Database | MongoDB Atlas via Mongoose |
| Hosting | GitHub Pages (frontend), Render (API) |

## Getting started

Requirements: Node.js 18+, a MongoDB connection string and a Groq API key.

```bash
git clone https://github.com/hellenicdev/inbox-simulator.git
cd inbox-simulator

# API
cd backend
cp .env.example .env   # fill in the values
npm install
npm run dev

# Frontend (new terminal)
cd ../frontend
cp .env.example .env
npm install
npm run dev            # http://localhost:5173/inbox-simulator/
```

Sender archetypes are seeded automatically on first start.

### Environment variables

Backend (`backend/.env`):

| Name | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `GROQ_API_KEY` | Groq API key for email generation |
| `JWT_SECRET` | Secret used to sign auth tokens (required, the server won't start without it) |
| `PORT` | API port (default `3001`) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret (verification is skipped if unset) |

Frontend (`frontend/.env`, or repository variables for the Pages workflow):

| Name | Purpose |
| --- | --- |
| `VITE_API_URL` | Base URL of the API, including `/api` |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key |

CORS is restricted to `https://hellenicdev.eu`.

## API

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Sign in |
| `GET` | `/api/emails` | List emails (`folder`, `search`, `category`, `page`, `limit`) |
| `GET` | `/api/emails/refresh` | Generate new emails |
| `PATCH` | `/api/emails/:id` | Update `read` or `folder` |
| `GET` | `/api/senders` | List sender archetypes |
| `GET` | `/api/health` | Health check |

## Project structure

```
inbox-simulator/
├── .github/workflows/deploy.yml   Builds and publishes the frontend to Pages
├── backend/
│   ├── src/
│   │   ├── config/        Database and Groq config
│   │   ├── middleware/    JWT auth, rate limiting
│   │   ├── models/        User, Email, Sender
│   │   ├── routes/        Auth, emails, senders
│   │   ├── seed/          Sender archetypes
│   │   ├── services/      Email generator, Turnstile
│   │   └── server.js
│   └── render.yaml
└── frontend/
    └── src/
        ├── api/           API client
        ├── components/    Auth, Email, Layout, UI
        ├── context/       Auth context
        ├── hooks/         useEmails
        └── utils/         Constants, date formatting
```

## License

© 2026 HellenicDev. All rights reserved.

Built by [HellenicDev](https://hellenicdev.eu).
