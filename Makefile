.PHONY: help build up down restart logs shell-backend shell-db test clean prune backend-logs db-logs redis-logs

# Default target
.DEFAULT_GOAL := help

# Color output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

##@ General

help: ## Display this help message
	@echo "$(CYAN)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║          FastAPI Monorepo - Docker Management             ║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage:\n  make $(GREEN)<target>$(NC)\n\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(CYAN)%-20s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(YELLOW)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Docker Operations

build: ## Build all Docker images
	@echo "$(GREEN)Building all Docker images...$(NC)"
	docker-compose build

build-backend: ## Build backend Docker image only
	@echo "$(GREEN)Building backend Docker image...$(NC)"
	docker-compose build backend

build-no-cache: ## Build all Docker images without cache
	@echo "$(GREEN)Building all Docker images (no cache)...$(NC)"
	docker-compose build --no-cache

up: ## Start all services
	@echo "$(GREEN)Starting all services...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ All services started!$(NC)"
	@echo "$(CYAN)Backend API: http://localhost:8000$(NC)"
	@echo "$(CYAN)API Docs: http://localhost:8000/docs$(NC)"
	@echo "$(CYAN)PostgreSQL: localhost:5432$(NC)"
	@echo "$(CYAN)Redis: localhost:6379$(NC)"

up-build: ## Build and start all services
	@echo "$(GREEN)Building and starting all services...$(NC)"
	docker-compose up -d --build

down: ## Stop all services
	@echo "$(YELLOW)Stopping all services...$(NC)"
	docker-compose down

down-volumes: ## Stop all services and remove volumes (⚠️  deletes data)
	@echo "$(RED)Stopping all services and removing volumes...$(NC)"
	docker-compose down -v

restart: ## Restart all services
	@echo "$(YELLOW)Restarting all services...$(NC)"
	docker-compose restart

restart-backend: ## Restart backend service only
	@echo "$(YELLOW)Restarting backend service...$(NC)"
	docker-compose restart backend

##@ Service Management

ps: ## Show running containers
	@docker-compose ps

status: ## Show detailed status of all services
	@echo "$(CYAN)Service Status:$(NC)"
	@docker-compose ps
	@echo ""
	@echo "$(CYAN)Container Health:$(NC)"
	@docker ps --filter "name=monorepo" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

##@ Logs

logs: ## Tail logs from all services
	docker-compose logs -f

logs-backend: ## Tail logs from backend service
	docker-compose logs -f backend

logs-db: ## Tail logs from database service
	docker-compose logs -f db

logs-redis: ## Tail logs from Redis service
	docker-compose logs -f redis

##@ Shell Access

shell-backend: ## Open shell in backend container
	@echo "$(CYAN)Opening shell in backend container...$(NC)"
	docker-compose exec backend /bin/bash

shell-db: ## Open PostgreSQL shell
	@echo "$(CYAN)Opening PostgreSQL shell...$(NC)"
	docker-compose exec db psql -U postgres -d app_db

shell-redis: ## Open Redis CLI
	@echo "$(CYAN)Opening Redis CLI...$(NC)"
	docker-compose exec redis redis-cli

##@ Database Operations

db-migrate: ## Run database migrations
	@echo "$(GREEN)Running database migrations...$(NC)"
	docker-compose exec backend alembic upgrade head

db-migrate-create: ## Create a new migration (use MSG="description")
	@echo "$(GREEN)Creating new migration...$(NC)"
	docker-compose exec backend alembic revision --autogenerate -m "$(MSG)"

db-rollback: ## Rollback last migration
	@echo "$(YELLOW)Rolling back last migration...$(NC)"
	docker-compose exec backend alembic downgrade -1

db-reset: ## Reset database (⚠️  drops all data)
	@echo "$(RED)Resetting database...$(NC)"
	docker-compose down -v
	docker-compose up -d db
	@sleep 3
	docker-compose up -d backend
	@echo "$(GREEN)Database reset complete$(NC)"

##@ Testing

test: ## Run tests in backend container
	@echo "$(GREEN)Running tests...$(NC)"
	docker-compose exec backend pytest

test-cov: ## Run tests with coverage
	@echo "$(GREEN)Running tests with coverage...$(NC)"
	docker-compose exec backend pytest --cov=app --cov-report=html --cov-report=term

test-verbose: ## Run tests in verbose mode
	@echo "$(GREEN)Running tests (verbose)...$(NC)"
	docker-compose exec backend pytest -v

##@ Development

lint: ## Run linters
	@echo "$(GREEN)Running linters...$(NC)"
	docker-compose exec backend ruff check app/
	docker-compose exec backend black --check app/

format: ## Format code
	@echo "$(GREEN)Formatting code...$(NC)"
	docker-compose exec backend black app/
	docker-compose exec backend ruff check --fix app/

type-check: ## Run type checking
	@echo "$(GREEN)Running type checker...$(NC)"
	docker-compose exec backend mypy app/

##@ Cleanup

clean: ## Remove stopped containers and dangling images
	@echo "$(YELLOW)Cleaning up...$(NC)"
	docker-compose down --remove-orphans
	docker system prune -f

clean-all: ## Remove all containers, images, and volumes (⚠️  nuclear option)
	@echo "$(RED)Removing all Docker resources...$(NC)"
	docker-compose down -v --rmi all --remove-orphans

prune: ## Remove all unused Docker resources
	@echo "$(YELLOW)Pruning unused Docker resources...$(NC)"
	docker system prune -af --volumes

##@ Monitoring

stats: ## Show container resource usage
	@echo "$(CYAN)Container Resource Usage:$(NC)"
	docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

health: ## Check health of all services
	@echo "$(CYAN)Checking service health...$(NC)"
	@echo "Backend API:"
	@curl -s http://localhost:8000/api/v1/health | python3 -m json.tool || echo "$(RED)✗ Backend not responding$(NC)"
	@echo ""
	@echo "Database:"
	@docker-compose exec -T db pg_isready -U postgres && echo "$(GREEN)✓ Database healthy$(NC)" || echo "$(RED)✗ Database unhealthy$(NC)"
	@echo ""
	@echo "Redis:"
	@docker-compose exec -T redis redis-cli ping && echo "$(GREEN)✓ Redis healthy$(NC)" || echo "$(RED)✗ Redis unhealthy$(NC)"

##@ Information

urls: ## Display all service URLs
	@echo "$(CYAN)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║                    Service URLs                           ║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo "$(GREEN)Backend API:$(NC)      http://localhost:8000"
	@echo "$(GREEN)API Documentation:$(NC) http://localhost:8000/docs"
	@echo "$(GREEN)ReDoc:$(NC)            http://localhost:8000/redoc"
	@echo "$(GREEN)PostgreSQL:$(NC)       localhost:5432"
	@echo "$(GREEN)Redis:$(NC)            localhost:6379"
	@echo ""
	@echo "$(YELLOW)Database Credentials:$(NC)"
	@echo "  User:     postgres"
	@echo "  Password: postgres"
	@echo "  Database: app_db"

version: ## Show versions of all components
	@echo "$(CYAN)Component Versions:$(NC)"
	@echo "Docker Compose: $$(docker-compose --version)"
	@echo "Docker: $$(docker --version)"
	@echo "Python: $$(docker-compose exec backend python --version 2>&1 || echo 'N/A')"
	@echo "FastAPI: $$(docker-compose exec backend python -c 'import fastapi; print(fastapi.__version__)' 2>&1 || echo 'N/A')"
