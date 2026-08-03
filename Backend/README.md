# AIScan Backend API

Production-ready Express API for the AI Scan & Caption app.

## Stack

- **Express 5** + TypeScript
- **Neon PostgreSQL** + Drizzle ORM
- **Cloudinary** — image storage & CDN
- **OpenAI** — vision captions & multimodal chat
- **JWT** — access + refresh tokens (bcrypt passwords)





## Setup

```bash
cd Backend
cp .env.example .env
# Fill in DATABASE_URL, JWT secrets, OpenAI, Cloudinary

npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Server runs at `http://localhost:3001`.



## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Run production build |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run typecheck` | TypeScript check |
