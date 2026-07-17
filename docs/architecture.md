# Architecture

## Overview

A monorepo (npm workspaces) with two deployable apps and a shared Postgres:

```
┌────────────────┐        HTTPS / JSON        ┌──────────────────────┐
│  client (SPA)  │ ─────────────────────────► │   server (Express)   │
│  React + Vite  │ ◄───────────────────────── │   REST API           │
│  Tailwind      │   access token (memory)     │   Zod · JWT · bcrypt │
└────────────────┘   refresh token (cookie)    └──────────┬───────────┘
                                                           │ Prisma
                                                           ▼
                                                 ┌──────────────────┐
                                                 │    PostgreSQL     │
                                                 └──────────────────┘
```

## Backend — layered, SOLID

Request flow, thin → deep:

```
route → middleware (validate / authenticate / authorize) → controller → service → Prisma
```

- **Routes** wire a URL to middleware + a controller. Nothing else.
- **Middleware** is the only place inputs are validated (Zod) and identity/role are
  enforced. `validate(schema, part)` replaces the request part with parsed data.
- **Controllers** are thin: read the parsed request, call one service, shape the
  response. No business rules.
- **Services** own all business logic and are the only code that talks to Prisma.
  They throw typed `AppError`s (`badRequest`/`unauthorized`/`forbidden`/`conflict`/
  `notFound`).
- **Error middleware** is the single translation point from thrown errors to JSON.

This keeps each layer single-responsibility and independently testable: unit tests
hit services/utilities directly; integration tests drive the whole stack with
Supertest against a real Postgres test database.

## Authentication & authorization

- **Passwords** hashed with bcrypt; never returned in any response.
- **Access token** — short-lived JWT (identity + role), returned in the login/refresh
  JSON body and held **only in browser memory** on the client.
- **Refresh token** — long-lived JWT delivered as an **HttpOnly cookie**, stored
  **hashed** in Postgres (`refresh_tokens`). Refresh **rotates** the token
  (old row revoked, new issued) → one-time use; a replayed token is rejected.
- **Silent refresh on load** — because the access token is memory-only, the client
  exchanges the refresh cookie for a new access token on app mount, so a page reload
  keeps the user signed in. An Axios response interceptor also refreshes-and-retries
  once on any 401.
- **Roles** — `USER` / `ADMIN`. Registration always yields `USER`; the seed script
  provisions the ADMIN. `authorize('ADMIN')` gates delete + restock, and fails closed.

## Inventory correctness

Purchasing decrements stock with a **single conditional SQL statement**:

```sql
UPDATE vehicles SET quantity = quantity - :qty
WHERE id = :id AND quantity >= :qty;   -- rowCount 0 ⇒ 404 or 409
```

Because the `quantity >= qty` guard and the decrement are one atomic statement,
concurrent buyers can never oversell — verified by a test that fires 10 simultaneous
purchases at 5 units and asserts exactly 5 succeed and stock lands at 0.

## Reproducibility

`docker-compose.yml` ships Postgres with a dev database and a dedicated
`dealership_test` database (created by `docker/init-test-db.sql`) on port **5434**,
so anyone who clones the repo can run the full stack and the whole test suite with no
external services.
