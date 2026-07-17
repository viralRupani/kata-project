# AI Prompt Log

This file is a running log of the AI-assisted development of the Car Dealership
Inventory System, per the kata's AI transparency policy. It records the intent and
prompts driving each phase. See the **My AI Usage** section of the README for a
narrative reflection.

**AI tool used:** Claude Code (Anthropic, Opus 4.8) as an agentic pair-programmer.

---

## Session 1 — Planning & scaffolding

**Goal given to the AI:** Build a full-stack Car Dealership Inventory System as a TDD
kata against a FIXED technology stack (Express + Prisma + PostgreSQL backend; React 19 +
Vite + Tailwind frontend; npm workspaces monorepo). Emphasis on a visible
Red-Green-Refactor commit history for all business logic, clean SOLID architecture, and
full reproducibility for a grader who clones the repo.

**Key decisions clarified with the human before coding:**
- Standalone git repo inside `kata-project/` (own history).
- Dedicated `docker-compose.yml` shipping Postgres with a dev + `_test` database on a
  fresh port (5434), so the repo is self-reproducible.
- Admin provisioning via a Prisma **seed script** (registration always yields `USER`).
- Full autonomous build: backend → frontend → docs.

**Scaffolding prompt (paraphrased):**
> Initialize the monorepo: git init, root `package.json` with npm workspaces, a
> `docker-compose.yml` running Postgres (dev + test DB on 5434), `.gitignore`, and
> Prettier config.

---

---

## Session 2 — Backend (strict TDD)

**Guiding instruction:** For every unit of business logic, follow Red → Green →
Refactor and commit at each step, so the git history itself demonstrates TDD.

**Prompts / intents, in order:**
1. > Set up the Express + TypeScript + Prisma skeleton: typed env (Zod), Prisma
   > client singleton pointed at the test DB under NODE_ENV=test, centralized error
   > middleware, `validate`/`authenticate`/`authorize` middleware, and a Supertest
   > harness (global schema push + per-test truncation helpers).
2. > TDD the auth endpoints one at a time — write the failing Supertest spec first,
   > commit it as red, then implement to green: register (unique email, forced USER
   > role, never leak the hash), login (access token in body + httpOnly refresh
   > cookie persisted+hashed in Postgres, uniform 401 to avoid user enumeration),
   > refresh with **one-time-use rotation**, and logout revocation.
3. > Unit-test the pure pieces: bcrypt password hash/verify, JWT round-trip, and the
   > `authorize` role gate (fail-closed 401/403).
4. > TDD the vehicles module: create + list, then search (case-insensitive partial
   > match + inclusive price range, with `/search` registered before `/:id`), then
   > update + admin-only delete.
5. > The important one — TDD purchase so stock can **never** go negative: write a
   > concurrency test firing 10 simultaneous purchases at 5 units and assert exactly
   > 5 succeed. Implement with a single conditional `updateMany`
   > (`where quantity >= qty`) so check-and-decrement is atomic. Then admin restock.
6. > Fix: the full suite timed out because each file re-ran `prisma db push`; move it
   > to a one-time vitest `globalSetup`. Also satisfy `tsc` on the jwt `expiresIn`
   > typing.

**Result:** 46 tests across 11 files, all green (~7s); clean `tsc --noEmit`; running
API verified by hand (health, login, auth-gated list, out-of-stock 409, 401).

<!-- Frontend + docs phases are appended below as the build progresses. -->

