# Entity-Relationship Diagram

```mermaid
erDiagram
    User ||--o{ RefreshToken : "has"

    User {
        string   id PK
        string   email UK
        string   name
        string   passwordHash
        Role     role "USER | ADMIN"
        datetime createdAt
        datetime updatedAt
    }

    RefreshToken {
        string   id PK "= JWT jti"
        string   tokenHash UK "sha256 of the token"
        string   userId FK
        datetime expiresAt
        datetime revokedAt "null until revoked/rotated"
        datetime createdAt
    }

    Vehicle {
        string   id PK
        string   make
        string   model
        string   category
        int      priceCents "integer cents, never float"
        int      quantity
        datetime createdAt
        datetime updatedAt
    }
```

## Notes

- **`User.role`** is a Postgres enum (`Role`). Only the seed script creates an
  `ADMIN`; the register endpoint always writes `USER`.
- **`RefreshToken`** persists refresh tokens server-side so they can be revoked
  (logout) and rotated (each refresh revokes the used row and inserts a new one).
  Only the SHA-256 hash is stored, so a database leak cannot be replayed.
- **`Vehicle.priceCents`** stores money as an integer number of cents — the UI works
  in rupees and converts at the boundary. No floating-point money anywhere.
- **`Vehicle` indexes** on `make`, `model`, `category` back the search endpoint.
