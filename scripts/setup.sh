#!/usr/bin/env bash
set -e

echo "🏛️ Initializing Campus Lost-and-Found Intelligence System (CLFIS)..."

# Create python venv
if [ ! -d "backend/venv" ]; then
    echo "📦 Creating backend Python virtual environment..."
    python3 -m venv backend/venv
fi

source backend/venv/bin/activate
echo "📥 Installing backend requirements..."
pip install -r backend/requirements.txt

echo "📥 Installing ML requirements..."
pip install -r ml/requirements-ml.txt

# Create uploads dir
mkdir -p backend/uploads

# Install frontend node modules
if [ -d "frontend" ]; then
    echo "📦 Installing frontend NPM packages..."
    cd frontend && npm install && cd ..
fi

echo "✅ CLFIS setup complete! Run 'docker-compose up -d' or start backend and frontend services."
