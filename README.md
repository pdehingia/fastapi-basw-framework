# FastAPI Framework

**Production-Ready Feature-Based FastAPI Architecture**

A comprehensive, production-ready FastAPI framework with best practices, clean architecture, and modern development patterns.

[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Features

### 🎯 Core Features

- **Feature-Based Architecture**: Organize code by business features/domains
- **Clean Separation**: API, business logic, and data access layers are clearly separated
- **Type-Safe**: Full Python type hints with Pydantic validation
- **Automatic Documentation**: OpenAPI/Swagger docs out of the box
- **Production-Ready**: Includes all essentials for deploying to production

### 🛡️ Security & Control

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Using bcrypt for secure password storage
- **Security Headers**: Comprehensive security headers middleware
- **CORS Support**: Configurable cross-origin resource sharing
- **Input Validation**: Pydantic models for request/response validation

### 🚀 Advanced Features

- **Database Management**: SQLAlchemy ORM with Alembic migrations
- **Caching**: Redis integration for performance optimization
- **Pagination**: Both offset and cursor-based pagination
- **Error Handling**: Global exception handling with standardized responses
- **Request Tracing**: Correlation IDs for tracking requests across services
- **Structured Logging**: JSON and text logging formats
- **Soft Deletes**: Built-in soft delete functionality
- **Audit Trail**: Track creation and modification timestamps

### 🧪 Testing & Quality

- **Test Suite**: Pytest with async support
- **Code Coverage**: pytest-cov integration
- **Code Quality**: Black, Ruff, and mypy for code quality
- **Docker Support**: Full Docker and docker-compose setup
- **Makefile**: Common tasks automated with make commands

## Installation

### Prerequisites

- Python 3.9+
- PostgreSQL (optional, SQLite works out of the box)
- Redis (optional, for caching)

### Quick Start

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/fastapi-framework.git
cd fastapi-framework
```

2. **Create virtual environment**

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**

```bash
make install
# Or manually: pip install -r requirements.txt
```

4. **Setup environment variables**

```bash
cp .env.example .env
# Edit .env and set your SECRET_KEY and other configurations
```

5. **Run the application**

```bash
make run
# Or manually: uvicorn app.main:app --reload
```

6. **Open your browser**

Visit http://localhost:8000/docs to see the automatic API documentation.

## Project Structure

```
fastapi-framework/
├── app/
│   ├── __init__.py
│   ├── main.py                      # FastAPI app initialization
│   │
│   ├── core/                        # Core functionality
│   │   ├── config.py                # Settings management
│   │   ├── database.py              # Database setup
│   │   ├── security.py              # Auth & security utilities
│   │   ├── exceptions.py            # Custom exceptions
│   │   ├── logging.py               # Logging configuration
│   │   ├── cache.py                 # Redis caching
│   │   └── dependencies.py          # Global dependencies
│   │
│   ├── api/                         # API layer
│   │   ├── deps.py                  # API dependencies
│   │   └── v1/                      # API version 1
│   │       ├── router.py            # Main router
│   │       └── endpoints/           # Route handlers
│   │           ├── auth.py
│   │           ├── users.py
│   │           └── health.py
│   │
│   ├── features/                    # Business features
│   │   ├── users/                   # User feature
│   │   │   ├── models.py            # SQLAlchemy models
│   │   │   ├── schemas.py           # Pydantic schemas
│   │   │   ├── repository.py        # Data access
│   │   │   └── service.py           # Business logic
│   │   │
│   │   └── auth/                    # Auth feature
│   │       ├── schemas.py
│   │       └── service.py
│   │
│   ├── shared/                      # Shared utilities
│   │   ├── base_models.py           # Base SQLAlchemy models
│   │   ├── base_repository.py       # Base repository pattern
│   │   ├── pagination.py            # Pagination helpers
│   │   ├── responses.py             # Response models
│   │   └── validators.py            # Custom validators
│   │
│   └── middleware/                  # Custom middleware
│       ├── error_handler.py         # Global error handling
│       ├── correlation_id.py        # Request tracing
│       ├── request_logging.py       # Request logging
│       └── security_headers.py      # Security headers
│
├── tests/                           # Tests
│   ├── conftest.py                  # Pytest fixtures
│   └── test_api.py                  # API tests
│
├── alembic/                         # Database migrations
├── .env.example                     # Environment template
├── requirements.txt                 # Dependencies
├── requirements-dev.txt             # Dev dependencies
├── Makefile                         # Common commands
├── docker-compose.yml               # Docker setup
├── Dockerfile                       # Docker image
└── README.md
```

## Configuration

All configuration is managed through environment variables. See `.env.example` for all available options.

Key configurations:

- `SECRET_KEY`: JWT secret key (required, min 32 characters)
- `DATABASE_URL`: Database connection string
- `REDIS_URL`: Redis connection string
- `ENVIRONMENT`: development/staging/production
- `DEBUG`: Enable debug mode
- `LOG_LEVEL`: Logging level (DEBUG, INFO, WARNING, ERROR)

## Database Migrations

```bash
# Create a new migration
make migrate-create message="add users table"

# Run migrations
make migrate

# Rollback last migration
make migrate-rollback
```

## Testing

```bash
# Run all tests
make test

# Run with coverage report
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_api.py -v
```

## Docker

```bash
# Start all services
make docker-up

# Stop all services
make docker-down

# View logs
make docker-logs

# Rebuild containers
make docker-build
```

## Development Commands

```bash
# Install dependencies
make install

# Install dev dependencies
make dev

# Run development server
make run

# Run production server
make run-prod

# Format code
make format

# Run linters
make lint

# Run tests
make test

# Clean generated files
make clean
```

## Architecture Principles

### Feature-Based Organization

Features are organized by business domain, not technical layer. Each feature contains:

- **Models**: Database schema (SQLAlchemy)
- **Schemas**: API contracts (Pydantic)
- **Repository**: Data access layer
- **Service**: Business logic

### Layered Architecture

1. **API Layer** (`app/api/`): HTTP routing and request handling
2. **Service Layer** (`features/*/service.py`): Business logic
3. **Repository Layer** (`features/*/repository.py`): Data access
4. **Model Layer** (`features/*/models.py`): Database schema

### Dependency Injection

FastAPI's dependency injection is used throughout:

```python
@router.get("/users/me")
async def get_current_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return current_user
```

## Best Practices

- ✅ Use type hints everywhere
- ✅ Validate all inputs with Pydantic
- ✅ Keep business logic in service layer
- ✅ Use repository pattern for data access
- ✅ Handle errors with custom exceptions
- ✅ Log important operations
- ✅ Write tests for critical paths
- ✅ Use migrations for schema changes
- ✅ Never store secrets in code
- ✅ Use soft deletes for user data

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for developers who value clean architecture and best practices**
