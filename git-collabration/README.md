# Git Collaborator Access Manager

Single Next.js application for repository visibility, collaborator discovery, and employee mapping.

## Stack

- Next.js App Router
- TypeScript
- Prisma
- PostgreSQL
- TailwindCSS

## Database

The database is expected to run in Docker via `docker-compose.yml`.

```bash
docker compose up -d postgres
```

## Setup

1. Copy `.env.example` to `.env`
2. Set `DATABASE_URL`, `GITHUB_PAT`, `GITHUB_OWNER`, `SESSION_SECRET`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD`
3. Install dependencies
4. Run `npm run prisma:generate` or Prisma db push/migrate
5. Start the dev server

## Hosting

Hosted on **Vercel** (frontend + API) + **Neon** (serverless PostgreSQL).

- Vercel Root Directory: `git-collabration`
- Neon connection string set as `DATABASE_URL` in Vercel environment variables
- `prisma generate` runs automatically during Vercel build via the `build` script

## Scripts

- `npm run dev`
- `npm run prisma:generate`
- `npm run db:push`
- `npm run prisma:studio`
- `npm run seed`
