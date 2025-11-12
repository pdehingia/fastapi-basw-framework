# Scripts Directory

This directory contains utility scripts for the Maya Platform backend.

## 📜 Available Scripts

### 🚀 **Deployment Scripts**

#### `deploy.ps1`
**Windows PowerShell deployment script**
- Complete Docker deployment with health checks
- Environment validation
- Service monitoring
- Windows-specific commands

```powershell
.\scripts\deploy.ps1
```

#### `docker-startup.sh` 
**Linux/Unix Docker startup script**
- Container initialization for Linux environments
- Used by Docker containers during startup

### 🔧 **Setup Scripts**

#### `setup.py`
**Python dependency and environment setup**
- Install all Python dependencies
- Create required directories
- Setup pre-commit hooks
- Environment validation

```bash
python scripts/setup.py
```

#### `validate-env.py`
**Environment configuration validator**
- Validate all environment variables
- Check external service credentials
- Security validation
- Database connection testing

```bash
python scripts/validate-env.py
```

### 🗄️ **Database Initialization**

#### `init-postgres.sql`
**PostgreSQL database initialization**
- Creates database schema
- Sets up initial tables
- Used by Docker Compose during PostgreSQL container startup

#### `init-mongodb.js`
**MongoDB initialization script**
- Creates MongoDB collections
- Sets up indexes
- Initializes user accounts
- Used by Docker Compose during MongoDB container startup

## 🎯 Common Usage Patterns

### First Time Setup
```bash
# 1. Install dependencies
python scripts/setup.py

# 2. Validate environment
python scripts/validate-env.py

# 3. Deploy with Docker
.\scripts\deploy.ps1  # Windows
# or
bash scripts/docker-startup.sh  # Linux
```

### Development Workflow
```bash
# Validate changes
python scripts/validate-env.py

# Deploy updates
.\scripts\deploy.ps1
```

### Production Deployment
```bash
# Set environment to production in .env
# ENVIRONMENT=production

# Run full deployment
.\scripts\deploy.ps1
```

## 🔍 Script Details

| Script | Purpose | Platform | Usage |
|--------|---------|----------|--------|
| `deploy.ps1` | Complete deployment | Windows | `.\scripts\deploy.ps1` |
| `setup.py` | Dependency installation | Cross-platform | `python scripts/setup.py` |
| `validate-env.py` | Environment validation | Cross-platform | `python scripts/validate-env.py` |
| `docker-startup.sh` | Container initialization | Linux/Container | Automatic |
| `init-postgres.sql` | PostgreSQL setup | Database | Automatic |
| `init-mongodb.js` | MongoDB setup | Database | Automatic |

## 🛡️ Security Notes

- All scripts validate environment variables before execution
- No hardcoded credentials in any script
- All external service connections are tested
- Scripts fail fast if requirements are not met

## 📋 Requirements

- **Python 3.11+** for Python scripts
- **PowerShell 5.0+** for Windows deployment
- **Docker & Docker Compose** for containerization
- **Valid .env file** with all required variables

## 🆘 Troubleshooting

If scripts fail:

1. **Check .env file**: `python scripts/validate-env.py`
2. **Verify Docker**: `docker --version`
3. **Check permissions**: Ensure scripts are executable
4. **View logs**: Check Docker container logs for details

For detailed troubleshooting, see the main [README.md](../README.md).