.PHONY: help up down build seed test eval clean

help:
	@echo "Available commands:"
	@echo "  make up      - Start all Docker containers"
	@echo "  make down    - Stop all containers"
	@echo "  make build   - Build Docker images"
	@echo "  make seed    - Seed mock campus data"
	@echo "  make test    - Run backend tests"
	@echo "  make eval    - Run ML evaluation benchmark"

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build

seed:
	python scripts/seed_database.py

test:
	cd backend && pytest tests/ -v

eval:
	python ml/src/evaluation/run_eval.py

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
