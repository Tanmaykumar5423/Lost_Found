# 🔌 CLFIS REST API Documentation

Interactive Swagger documentation is available at `http://localhost:8000/docs`.

## Endpoint Summary

### Authentication (`/api/auth`)
- `POST /register`: Register user with `@college.edu` domain.
- `POST /login`: Issue JWT bearer token.
- `GET /me`: Authenticated user profile and karma score.

### Item Reporting & Feed (`/api/items`)
- `POST /report`: Ingests multipart form (up to 3 images), category, campus zone, description, timestamp, and optional ZK ground truth. Dispatches background ML candidate matching.
- `GET /feed`: Paginated feed of open reports with zero-knowledge image masking for high-value items.
- `GET /user/items`: Items reported by the current user.
- `GET /{item_id}`: Single item details.

### AI Matching (`/api/matches`)
- `POST /find/{lost_item_id}`: Trigger match generation.
- `GET /user/matches`: All matches associated with current user's items.
- `GET /{match_id}`: Detailed multimodal and decay scores for a match.

### Zero-Knowledge Claims & QR Handshake (`/api/claims`)
- `POST /challenge/create`: Create verification challenge for a match.
- `POST /challenge/respond`: Submit claimant proof answer.
- `POST /challenge/approve`: Approve challenge and issue 15-minute signed JWT QR token.
- `POST /handshake/verify`: Verify QR token upon physical item pickup, award +25 Karma, and mark items `RESOLVED`.

### Admin & Vault (`/api/admin`)
- `GET /vault/unclaimed`: Items older than 45 days.
- `POST /vault/process`: Bulk transition to `UNCLAIMED_VAULT` for charity donation or campus auction.
- `GET /qr-scans`: Handshake custody audit ledger.
- `GET /stats`: Real-time system resolution statistics.
