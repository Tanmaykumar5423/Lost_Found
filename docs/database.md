# 🗄️ CLFIS Database Specification

PostgreSQL 16 relational schema with `pgvector` and `postgis` extensions.

## Extensions
```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS postgis;
```

## Relational Schema

### 1. `users`
- `id`: Serial Primary Key
- `email`: VARCHAR(255) UNIQUE NOT NULL
- `hashed_password`: VARCHAR(255) NOT NULL
- `full_name`: VARCHAR(100) NOT NULL
- `role`: user_role (`STUDENT`, `STAFF`, `SECURITY_ADMIN`)
- `karma_score`: INTEGER (Default: 100)
- `created_at`, `updated_at`: TIMESTAMPTZ

### 2. `items`
- `id`: Serial Primary Key
- `user_id`: INTEGER REFERENCES `users.id`
- `type`: item_type (`LOST`, `FOUND`)
- `title`: VARCHAR(150)
- `description`: TEXT
- `category`: item_category (`ELECTRONICS`, `WALLETS_CARDS`, `KEYS`, `CLOTHING`, `DOCUMENTS`, `OTHER`)
- `campus_zone`: VARCHAR(100)
- `incident_time`: TIMESTAMPTZ
- `image_urls`: TEXT[]
- `image_embedding`: `vector(768)` (HNSW Indexed)
- `text_embedding`: `vector(768)` (HNSW Indexed)
- `ocr_tokens`: TEXT[]
- `is_high_value`: BOOLEAN (Default: False)
- `private_details`: TEXT (Zero-Knowledge ground truth)
- `status`: item_status (`OPEN`, `MATCH_PENDING`, `HANDOVER_SCHEDULED`, `RESOLVED`, `UNCLAIMED_VAULT`)

### 3. `matches`
- `id`: Serial Primary Key
- `lost_item_id`: INTEGER REFERENCES `items.id`
- `found_item_id`: INTEGER REFERENCES `items.id`
- `visual_score`, `text_score`, `category_score`, `spatial_decay`, `temporal_decay`, `ocr_bonus`, `total_score`: FLOAT
- `status`: match_status (`HIGH_CONFIDENCE`, `POTENTIAL`, `REJECTED`, `VERIFIED`)

### 4. `claims`
- `id`: Serial Primary Key
- `match_id`: INTEGER REFERENCES `matches.id`
- `claimant_id`: INTEGER REFERENCES `users.id`
- `challenge_question`: TEXT
- `claimant_answer`: TEXT
- `is_challenge_approved`: BOOLEAN
- `handshake_qr_token`: VARCHAR(500)
- `handover_by_user_id`: INTEGER REFERENCES `users.id`
- `resolved_at`: TIMESTAMPTZ
