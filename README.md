# Campus Lost & Found

This is the complete implementation of the Campus Lost-and-Found Intelligence System (CLFIS).

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+
- PostgreSQL 16 (via Docker)

### Setup with Docker Compose

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- Backend FastAPI server (port 8000)
- Frontend Next.js application (port 3000)

### Manual Setup

#### Database
```bash
docker run --name clfis-pg -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=clfis_db -p 5432:5432 -d postgis/postgis:16-3.4
```

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

- **database/**: PostgreSQL schema with pgvector & PostGIS
- **backend/**: FastAPI application with ML services
- **frontend/**: Next.js 14 app with React & Tailwind
- **ml/**: ML evaluation suite and model integration
- **scripts/**: Setup and utility scripts

## Features

✅ Multimodal item matching (SigLIP embeddings)
✅ Spatiotemporal scoring with decay functions
✅ Zero-Knowledge claim verification
✅ Cryptographic QR handshake system
✅ Campus zone awareness (PostGIS)
✅ OCR token extraction & matching
✅ Karma score system
✅ Admin vault management
✅ ML metrics evaluation (MRR, NDCG, Recall@K)

## API Documentation

Visit `http://localhost:8000/docs` for interactive API docs (Swagger UI)

## Environment Variables

Create `.env` file:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/clfis_db
SECRET_KEY=your-secret-key
CAMPUS_EMAIL_DOMAIN=college.edu
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Architecture

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand for state management
- Axios for API calls

### Backend
- FastAPI
- SQLAlchemy ORM
- PostgreSQL with pgvector & PostGIS
- Pydantic validation
- JWT authentication

### ML Pipeline
- Hugging Face SigLIP model
- Tesseract OCR
- Vector embeddings (768-d)
- Scikit-learn metrics

## Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### ML Benchmarks
```bash
python ml/src/evaluation/run_eval.py
```

## Contributing

See `CONTRIBUTING.md` for guidelines

## License

MIT
