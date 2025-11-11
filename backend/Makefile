.PHONY: install dev test lint format migrate run docker-up docker-down clean help

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install production dependencies
	pip install -r requirements.txt

dev: ## Install development dependencies and setup pre-commit
	pip install -r requirements-dev.txt
	pre-commit install

test: ## Run all tests with coverage
	pytest tests/ -v --cov=app --cov-report=html --cov-report=term

test-unit: ## Run unit tests only
	pytest tests/unit/ -v

test-integration: ## Run integration tests only
	pytest tests/integration/ -v

lint: ## Run linters (ruff and mypy)
	ruff check app/ tests/
	mypy app/

format: ## Format code with black and isort
	black app/ tests/
	ruff check --fix app/ tests/

migrate: ## Run database migrations
	alembic upgrade head

migrate-create: ## Create a new migration (usage: make migrate-create message="your message")
	@if [ -z "$(message)" ]; then \
		echo "Error: Please provide a message. Usage: make migrate-create message=\"your message\""; \
		exit 1; \
	fi
	alembic revision --autogenerate -m "$(message)"

migrate-rollback: ## Rollback last migration
	alembic downgrade -1

run: ## Run development server with auto-reload
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

run-prod: ## Run production server with multiple workers
	uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

docker-up: ## Start Docker containers
	docker-compose up -d

docker-down: ## Stop Docker containers
	docker-compose down

docker-logs: ## Show Docker logs
	docker-compose logs -f

docker-build: ## Build Docker image
	docker-compose build

clean: ## Clean up generated files
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "htmlcov" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name ".coverage" -delete
	find . -type f -name "*.db" -delete

seed: ## Seed database with sample data
	python scripts/seed_db.py

init-db: ## Initialize database
	python scripts/init_db.py

shell: ## Open Python shell with app context
	python -i -c "from app.main import app; from app.core.database import SessionLocal; db = SessionLocal()"

db-shell: ## Open database shell
	sqlite3 app.db

create-admin: ## Create admin user (interactive)
	python scripts/create_admin.py
