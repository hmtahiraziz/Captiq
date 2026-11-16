# AIScan Backend API

Production-ready Express API for the AI Scan & Caption app.

## Stack

- **Express 5** + TypeScript
- **Neon PostgreSQL** + Drizzle ORM
- **Cloudinary** — image storage & CDN
- **OpenAI** — vision captions & multimodal chat
- **JWT** — access + refresh tokens (bcrypt passwords)
- **SMTP (Nodemailer)** — password reset emails

## Setup

```bash
cd Backend
cp .env.example .env
# Fill in DATABASE_URL, JWT secrets, OpenAI, Cloudinary, SMTP

npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Server runs at `http://localhost:3001`.

### Email (SMTP)

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM` in `.env`.

Gmail example: use an [App Password](https://myaccount.google.com/apppasswords) (not your normal password), `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_SECURE=false`.

In development, if SMTP is unset, forgot-password still succeeds but no email is sent (check server logs). In production, SMTP is required.



## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Run production build |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run typecheck` | TypeScript check |
