# Test Report

_Generated from the passing suites. Reproduce with `npm test` from the repo root
(requires the Docker Postgres from `npm run db:up`)._

## Summary

| Suite     | Framework                | Files | Tests | Result |
|-----------|--------------------------|------:|------:|:------:|
| Backend   | Vitest + Supertest       |    12 |    48 | ✅ pass |
| Frontend  | Vitest + RTL + user-event|     3 |    13 | ✅ pass |
| **Total** |                          | **15**| **61**| ✅ pass |

## Backend (`npm run test:server`)

```
 ✓ src/modules/vehicles/vehicles.inventory.test.ts (9 tests)
 ✓ src/modules/vehicles/vehicles.mutate.test.ts    (6 tests)
 ✓ src/modules/auth/auth.refresh.test.ts           (4 tests)
 ✓ src/modules/vehicles/vehicles.search.test.ts    (6 tests)
 ✓ src/modules/auth/auth.login.test.ts             (3 tests)
 ✓ src/modules/vehicles/vehicles.crud.test.ts      (5 tests)
 ✓ src/modules/auth/auth.register.test.ts          (3 tests)
 ✓ src/middleware/authorize.test.ts                (3 tests)
 ✓ src/modules/auth/auth.me.test.ts                (2 tests)
 ✓ src/utils/jwt.test.ts                           (3 tests)
 ✓ src/utils/password.test.ts                      (3 tests)
 ✓ src/tests/health.test.ts                        (1 test)

 Test Files  12 passed (12)
      Tests  48 passed (48)
```

### What the backend suite proves
- **Auth**: register (unique email, forced USER role, hash never leaked), login
  (access token + httpOnly refresh cookie persisted+hashed), refresh **rotation**
  (one-time-use — a reused token is rejected), logout revocation, `/me` bootstrap.
- **Authorization**: the `authorize` role gate fails closed (401 with no user, 403
  for the wrong role); delete and restock are ADMIN-only.
- **Vehicles**: create + validation, list, search (case-insensitive partial match,
  inclusive price-range boundaries, `/search` routed before `/:id`), update, delete.
- **Inventory (the crown jewel)**: purchase decrements atomically; **10 concurrent
  purchases against 5 units sell exactly 5 and never drive stock negative**;
  insufficient stock → 409; missing vehicle → 404.

## Frontend (`npm run test:client`)

```
 ✓ src/components/RouteGuards.test.tsx  (5 tests)
 ✓ src/components/VehicleCard.test.tsx  (5 tests)
 ✓ src/pages/LoginPage.test.tsx         (3 tests)

 Test Files  3 passed (3)
      Tests  13 passed (13)
```

### What the frontend suite proves
- **Component**: `VehicleCard` renders details, disables **Purchase at zero stock**,
  and shows admin controls only to admins.
- **Form**: `LoginPage` surfaces Zod validation errors and only calls `login` with
  valid input.
- **Auth-flow**: `ProtectedRoute` redirects anonymous users to `/login` and renders
  a loader while the session restores; `AdminRoute` blocks non-admins.
