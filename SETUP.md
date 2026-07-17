# Setup & Run Guide

How to run the Car Dealership Inventory System on a fresh machine.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 20 | includes `npm` |
| Docker + Docker Compose | any recent | runs PostgreSQL locally |

Check with:

```bash
node -v      # v20+ expected
docker -v
```

---

## Quick start

Run these from the project root (`car-dealership-inventory/`):

```bash
# 1. Install dependencies (root + client + server workspaces)
npm install

# 2. Start PostgreSQL — dev DB + test DB on host port 5434
npm run db:up

# 3. Create local env files from the templates
cp server/.env.example server/.env
cp client/.env.example client/.env

# 4. Generate the Prisma client, apply migrations, seed admin + demo data
npm run prisma:generate -w server
npm run prisma:migrate  -w server
npm run prisma:seed     -w server

# 5. Start the apps (each in its own terminal)
npm run dev:server      # API  → http://localhost:4000
npm run dev:client      # SPA  → http://localhost:5173
```

Then open **http://localhost:5173**.

---

## Seeded login

| Role  | Email                   | Password      |
|-------|-------------------------|---------------|
| ADMIN | `admin@dealership.test` | `Admin@12345` |

Registering through the UI always creates a regular `USER`. The admin above is
created by the seed script (step 4) — use it to see the add / edit / delete /
restock controls.

---

## Running the tests

The backend suite needs the database running (step 2).

```bash
npm test              # backend + frontend (61 tests)

npm run test:server   # backend only — Vitest + Supertest
npm run test:client   # frontend only — Vitest + React Testing Library
```

---

## Handy scripts (run from the root)

| Command | What it does |
|---------|--------------|
| `npm run db:up` | Start PostgreSQL (Docker) |
| `npm run db:down` | Stop PostgreSQL |
| `npm run dev:server` | Run the API in watch mode (port 4000) |
| `npm run dev:client` | Run the SPA dev server (port 5173) |
| `npm test` | Run all tests |
| `npm run lint` | Lint both workspaces |
| `npm run format` | Format the repo with Prettier |

---

## How it fits together

```
client (Vite :5173)  ──/api proxy──►  server (Express :4000)  ──Prisma──►  PostgreSQL (:5434)
```

- The Vite dev server proxies `/api` to the API, so the HTTP-only refresh-token
  cookie stays same-origin — no extra CORS setup needed for local dev.
- PostgreSQL uses host port **5434** (not the default 5432) to avoid clashing with
  any other local database. This is set in `docker-compose.yml` and
  `server/.env.example`.

---

## Troubleshooting

**Port 5434 already in use** — another Postgres is on that port. Edit the port in
`docker-compose.yml` and the `DATABASE_URL` / `TEST_DATABASE_URL` in `server/.env`,
then `npm run db:up` again.

**`Environment variable not found: DATABASE_URL`** — you skipped step 3. Copy
`server/.env.example` to `server/.env`.

**Prisma client / type errors on first run** — run `npm run prisma:generate -w server`
(step 4). It generates the typed client into `node_modules`.

**Backend tests fail to connect** — make sure the database is up (`npm run db:up`) and
healthy. The test suite talks to the dedicated `dealership_test` database, which the
container creates automatically on first boot via `docker/init-test-db.sql`.

**Reset the database from scratch** —
```bash
npm run db:down
docker volume rm car-dealership-inventory_dealership_pgdata
npm run db:up
npm run prisma:migrate -w server && npm run prisma:seed -w server
```
