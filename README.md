# 🚗 Car Dealership Inventory System

A full-stack, single-page application for managing a car dealership's vehicle
inventory. Users can browse and purchase vehicles; administrators can add, update,
delete, and restock inventory. Built as a Test-Driven-Development kata.

> Built with a **fixed** technology stack — Express + Prisma + PostgreSQL on the
> backend, React 19 + Vite + Tailwind on the frontend, in an npm-workspaces monorepo.

---

## ✨ Features

- **Token-based auth** — JWT access token (kept in React memory) + rotating refresh
  token (HTTP-only cookie, persisted in Postgres). Silent refresh on page load.
- **Role-based authorization** — `USER` and `ADMIN` roles; admin-only delete & restock.
- **Vehicle inventory** — list, search/filter (make, model, category, price range),
  create, update, delete.
- **Purchasing** — atomic stock decrement that can never go negative; the Purchase
  button disables at zero stock.
- **Admin tooling** — add/edit/delete vehicles and restock inventory from the UI.

---

## 🧱 Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 19, Vite, TypeScript, Tailwind CSS, React Router, Axios, React Hook Form, Zod, Sonner |
| Backend   | Node.js, Express, TypeScript, Prisma ORM, Zod |
| Database  | PostgreSQL (via Docker) |
| Auth      | JWT (access + refresh), bcrypt |
| Testing   | Vitest, Supertest, React Testing Library |
| Tooling   | npm workspaces, ESLint, Prettier, Docker Compose |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 20
- Docker + Docker Compose

### 1. Clone & install
```bash
git clone <your-repo-url>
cd car-dealership-inventory
npm install
```

### 2. Start the database
```bash
npm run db:up        # Postgres on localhost:5434 (dev + test databases)
```

### 3. Configure environment
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 4. Migrate & seed
```bash
npm run prisma:migrate -w server
npm run prisma:seed -w server        # creates the admin account
```

### 5. Run
```bash
npm run dev:server     # API on http://localhost:4000
npm run dev:client     # App on http://localhost:5173
```

### Seeded accounts
| Role  | Email                  | Password      |
|-------|------------------------|---------------|
| ADMIN | admin@dealership.test  | Admin@12345   |

---

## 🧪 Tests

```bash
npm test                 # backend + frontend
npm run test:server      # backend (Vitest + Supertest)
npm run test:client      # frontend (Vitest + RTL)
```

_A full test report is captured in [`docs/test-report.md`](docs/test-report.md)._

---

## 📸 Screenshots

_Added during the verification phase — see [`docs/screenshots/`](docs/screenshots/)._

---

## 🤖 My AI Usage

_Completed at the end of the build — see the dedicated section below and
[`PROMPTS.md`](PROMPTS.md) for the full prompt log._

---

## 📂 Project Structure

```
car-dealership-inventory/
├── client/           # React 19 SPA (Vite + Tailwind)
├── server/           # Express + Prisma REST API
├── docs/             # architecture notes, ERD, test report, screenshots
├── postman/          # Postman collection + environment
├── docker-compose.yml
└── package.json      # npm workspaces root
```

---

## 📜 API Endpoints

| Method | Endpoint                        | Auth   | Description |
|--------|---------------------------------|--------|-------------|
| POST   | `/api/auth/register`            | –      | Register (email, name, password) |
| POST   | `/api/auth/login`               | –      | Login → access token + refresh cookie |
| POST   | `/api/auth/refresh`             | cookie | Rotate refresh token, new access token |
| POST   | `/api/auth/logout`              | cookie | Revoke refresh token |
| GET    | `/api/vehicles`                 | user   | List all vehicles |
| GET    | `/api/vehicles/search`          | user   | Search by make/model/category/price |
| POST   | `/api/vehicles`                 | user   | Add a vehicle |
| PUT    | `/api/vehicles/:id`             | user   | Update a vehicle |
| DELETE | `/api/vehicles/:id`             | admin  | Delete a vehicle |
| POST   | `/api/vehicles/:id/purchase`    | user   | Purchase (decrement stock) |
| POST   | `/api/vehicles/:id/restock`     | admin  | Restock (increment stock) |
