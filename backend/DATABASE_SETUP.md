# Maya Platform Database Setup Guide

## Overview
This guide will help you set up the complete Maya Platform database architecture, including:
- **PostgreSQL**: 30 tables for core platform functionality
- **MongoDB**: 6 collections for high-volume and flexible data
- **Initial Data**: Roles, permissions, and service configurations

## Prerequisites

### 1. Database Systems
- **PostgreSQL 12+** with extensions:
  - `uuid-ossp` (UUID generation)
  - `postgis` (geospatial data)
  - `pgcrypto` (encryption)
  - `pg_trgm` (text search)
- **MongoDB 5.0+** (Community or Enterprise)
- **Redis 6+** (for caching)

### 2. Development Environment
- Python 3.8+
- Node.js 16+ (for web frontend)

## Quick Setup

### Automated Setup (Recommended)
Run the complete setup script:

```bash
cd backend
python scripts/complete_setup.py
```

This script will:
1. ✅ Check all prerequisites
2. 🗄️ Create databases
3. 📦 Install Python dependencies
4. ⚙️ Set up environment configuration
5. 🚀 Run all migrations
6. 🔍 Verify the setup

### Manual Setup

If you prefer manual setup or need to troubleshoot:

#### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### 2. Create Databases
```bash
# PostgreSQL
createdb -h localhost -U postgres maya_platform

# MongoDB (created automatically)
```

#### 3. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
```

#### 4. Run Migrations
```bash
# Setup databases
python scripts/setup_databases.py

# Verify setup
python scripts/verify_setup.py
```

## Database Architecture

### PostgreSQL Tables (30 total)

#### Core Tables (Migration 001)
- `users` - User accounts and authentication
- `user_profiles` - Extended user information
- `roles` - System roles (admin, provider, user)
- `permissions` - System permissions
- `user_roles` - User-role assignments
- `role_permissions` - Role-permission assignments
- `user_sessions` - Active user sessions
- `audit_logs` - System audit trail

#### User & Profile Tables (Migration 002)
- `user_preferences` - User settings and preferences
- `user_addresses` - User delivery/billing addresses
- `user_payment_methods` - Saved payment information
- `user_documents` - Identity verification documents
- `provider_profiles` - Service provider profiles
- `provider_services` - Services offered by providers
- `provider_availability` - Provider schedule management
- `provider_ratings` - Provider performance metrics

#### Business Tables (Migration 003)
- `categories` - Service categories
- `services` - Available services
- `bookings` - Service bookings/appointments
- `booking_items` - Individual items in bookings
- `reviews` - User reviews and ratings
- `notifications` - System notifications
- `support_tickets` - Customer support system

#### Financial Tables (Migration 004)
- `transactions` - Financial transactions
- `payments` - Payment processing records
- `invoices` - Billing invoices
- `wallet_transactions` - Digital wallet operations
- `promotional_codes` - Discount codes and campaigns

#### Advanced Tables (Migration 005)
- `geolocation_data` - Geographic information
- `system_configs` - System configuration settings

### MongoDB Collections (6 total)
- `chats` - Real-time messaging (TTL: 30 days)
- `user_activities` - User activity tracking (TTL: 90 days)
- `analytics_events` - Event analytics (TTL: 365 days)
- `provider_portfolios` - Rich media portfolios
- `dynamic_content` - CMS content
- `time_series_data` - Performance metrics (TTL: 30 days)

## Migration Files

The database setup is organized into 5 logical migrations:

1. **001_create_core_tables.py** - Authentication and authorization
2. **002_create_user_profile_tables.py** - User and provider profiles
3. **003_create_business_tables.py** - Core business functionality
4. **004_create_financial_tables.py** - Payment and billing
5. **005_create_advanced_tables.py** - Geolocation and configuration

## Verification

After setup, the verification script checks:
- ✅ Database connectivity
- ✅ All tables created with correct schema
- ✅ All indexes properly created
- ✅ MongoDB collections and indexes
- ✅ Initial data seeded correctly
- ✅ Foreign key constraints working

## Troubleshooting

### Common Issues

#### PostgreSQL Connection Failed
```bash
# Check if PostgreSQL is running
systemctl status postgresql  # Linux
brew services start postgresql  # macOS
# Windows: Check Services app

# Check connection
psql -h localhost -U postgres -d postgres
```

#### MongoDB Connection Failed
```bash
# Check if MongoDB is running
systemctl status mongod  # Linux
brew services start mongodb-community  # macOS
# Windows: Check Services app

# Check connection
mongosh  # or mongo for older versions
```

#### Migration Errors
```bash
# Reset PostgreSQL database
dropdb maya_platform
createdb maya_platform

# Re-run setup
python scripts/complete_setup.py
```

#### Missing Extensions
```sql
-- Connect to PostgreSQL as superuser
psql -h localhost -U postgres -d maya_platform

-- Install required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### Development Tips

#### Database Reset
```bash
# Complete reset
python scripts/reset_databases.py
python scripts/complete_setup.py
```

#### Individual Migration
```bash
# Run specific migration
alembic upgrade 001

# Rollback migration
alembic downgrade -1
```

#### Check Migration Status
```bash
# Show current migration status
alembic current

# Show migration history
alembic history
```

## Environment Variables

Key configuration in `.env`:

```env
# PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/maya_platform

# MongoDB
MONGODB_URL=mongodb://localhost:27017
MONGODB_DATABASE=maya_platform_mongo

# Redis
REDIS_URL=redis://localhost:6379/0
```

## Next Steps

After successful setup:

1. **Start the application**:
   ```bash
   uvicorn app.main:app --reload
   ```

2. **Access API documentation**: http://localhost:8000/docs

3. **Implement features**: Begin with user authentication and service booking flows

4. **Add your business logic**: Customize the models and add your specific requirements

## Support

If you encounter issues:
1. Check the verification output for specific error details
2. Review the troubleshooting section above
3. Check the logs in `logs/` directory
4. Ensure all prerequisites are properly installed

The Maya Platform database is now ready for your application development! 🚀