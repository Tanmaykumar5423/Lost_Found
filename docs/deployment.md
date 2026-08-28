# 🚀 Deployment Guide

## Docker Compose Quickstart

```bash
docker-compose up -d --build
```

Services:
- **PostgreSQL 16 + PostGIS + pgvector**: Port `5432`
- **FastAPI Backend Server**: Port `8000`
- **Next.js 14 Frontend Client**: Port `3000`

## Manual Local Development

### 1. Database
```bash
docker run --name clfis-pg \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=clfis_db \
  -p 5432:5432 -d postgis/postgis:16-3.4
```

### 2. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
