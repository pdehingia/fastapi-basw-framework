# FastAPI Framework - Monorepo

A comprehensive full-stack application with FastAPI backend and multiple frontend applications.

[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📁 Project Structure

This is a **monorepo** containing multiple applications:

```
fastapi-framework/
├── backend/           # FastAPI backend (Python)
│   ├── app/          # Application code
│   ├── tests/        # Test suite
│   ├── alembic/      # Database migrations
│   └── ...
│
├── admin/            # Admin dashboard (Frontend)
│
├── provider/         # Provider application (Frontend)
│
└── web/              # Web application (Frontend)
```

## 🚀 Applications

### Backend (FastAPI)

Production-ready FastAPI backend with:
- **Feature-based architecture** organized by business domains
- **JWT authentication** with secure password hashing
- **Database management** with SQLAlchemy + Alembic migrations
- **Redis caching** for performance optimization
- **Comprehensive middleware** (error handling, logging, security headers)
- **Pagination** support (offset and cursor-based)
- **Soft deletes** and audit trails
- **API documentation** with Swagger/OpenAPI

📚 **[View Backend Documentation](./backend/README.md)**

### Admin Dashboard

Admin dashboard for managing the platform.

📚 **[View Admin Documentation](./admin/README.md)**

### Provider Application

Provider-facing application.

📚 **[View Provider Documentation](./provider/README.md)**

### Web Application

Public-facing web application.

📚 **[View Web Documentation](./web/README.md)**

## 🛠️ Quick Start

### Option 1: Docker (Recommended) 🐳

The fastest way to get started:

```bash
# Clone the repository
git clone <repository-url>
cd fastapi-framework

# Start all services with Docker
make up

# View logs
make logs

# Check health
make health
```

**Access the services:**
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Option 2: Local Development

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env and set your SECRET_KEY

# Run the application
uvicorn app.main:app --reload

# Or use make
make run
```

Visit http://localhost:8000/docs for API documentation.

#### Frontend Applications Setup

```bash
# Admin
cd admin
# Setup instructions in admin/README.md

# Provider
cd provider
# Setup instructions in provider/README.md

# Web
cd web
# Setup instructions in web/README.md
```

## 🐳 Docker (Recommended)

### Quick Start with Docker

The entire monorepo is fully Dockerized for easy development:

```bash
# Start all services
make up

# Or manually
docker-compose up -d
```

This will start:
- **Backend API** (port 8000) - FastAPI application
- **PostgreSQL** (port 5432) - Database
- **Redis** (port 6379) - Cache

### Docker Commands (via Makefile)

```bash
make help              # Show all available commands
make up                # Start all services
make down              # Stop all services
make logs              # View logs from all services
make logs-backend      # View backend logs only
make shell-backend     # Open shell in backend container
make shell-db          # Open PostgreSQL shell
make test              # Run tests
make db-migrate        # Run database migrations
make health            # Check health of all services
make urls              # Display all service URLs
```

### Docker Compose Commands

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Reset everything (⚠️ deletes data)
docker-compose down -v
```

### Production Deployment

The backend uses a multi-stage Dockerfile for optimized production builds:
- Smaller image size (build dependencies removed)
- Non-root user for security
- Health checks included
- Optimized layer caching

## 📖 Documentation

- **[Backend API Documentation](./backend/README.md)** - FastAPI backend setup and architecture
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to this project
- **[License](./LICENSE)** - MIT License

## 🏗️ Architecture

### Backend Architecture

The backend follows a clean, feature-based architecture:

```
backend/app/
├── core/          # Config, database, security, logging
├── api/           # HTTP endpoints (versioned)
├── features/      # Business features (users, auth, etc.)
├── shared/        # Shared utilities and base classes
└── middleware/    # Custom middleware
```

**Key Principles:**
- ✅ Feature-based organization by business domain
- ✅ Clear separation of concerns (API → Service → Repository → Model)
- ✅ Dependency injection with FastAPI
- ✅ Type safety with Pydantic validation
- ✅ Repository pattern for data access
- ✅ Comprehensive error handling
- ✅ Request tracing with correlation IDs

## 🔧 Development

### Prerequisites

**With Docker (Recommended):**
- Docker 20.10+
- Docker Compose 2.0+

**Without Docker:**
- **Backend**: Python 3.9+, PostgreSQL 15+, Redis 7+
- **Frontend**: Node.js 18+ (versions may vary per frontend)

### Common Commands

**With Docker (from root directory):**
```bash
make up              # Start all services
make down            # Stop all services
make logs-backend    # View backend logs
make test            # Run tests
make db-migrate      # Run migrations
make shell-backend   # Access backend container
make help            # See all commands
```

**Backend (local development):**
```bash
cd backend
make install      # Install dependencies
make test         # Run tests
make lint         # Run linters
make format       # Format code
make migrate      # Run database migrations
```

## 🧪 Testing

```bash
# Backend tests
cd backend
make test

# With coverage
pytest --cov=app --cov-report=html
```

## 📝 Environment Variables

Each application has its own environment configuration:

- **Backend**: See `backend/.env.example`
- **Admin**: See `admin/.env.example` (when available)
- **Provider**: See `provider/.env.example` (when available)
- **Web**: See `web/.env.example` (when available)

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🔗 Links

- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Admin Dashboard**: http://localhost:3000 (when running)
- **Provider App**: http://localhost:3001 (when running)
- **Web App**: http://localhost:3002 (when running)

---

**Built with ❤️ for developers who value clean architecture and best practices**
