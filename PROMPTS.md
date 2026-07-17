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

<!-- Subsequent phases are appended below as the build progresses. -->
